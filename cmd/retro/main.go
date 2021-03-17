package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/logger"
	"github.com/zaydek/retro/pkg/terminal"
)

type templateError struct {
	err error
}

func newTemplateError(str string) templateError {
	return templateError{err: errors.New(str)}
}

func (t templateError) Error() string {
	return t.err.Error()
}

// export function missingDocumentAppTag(src: string): string {
// 	return format(`
// 		${src}: Add '%app%' somewhere to '<body>'.
//
// 		For example:
//
// 		${terminal.dim(`// ${src}`)}
// 		<!DOCTYPE html>
// 			<head lang="en">
// 				${terminal.dim("...")}
// 			</head>
// 			<body>
// 				${terminal.magenta("%app%")}
// 				${terminal.dim("...")}
// 			</body>
// 		</html>
// 	`)
// }

// testASCIIRune tests for ASCII-safe runes.
func testASCIIRune(r rune) bool {
	ok := (r >= 'a' && r <= 'z') || (r >= 'A' && r <= 'Z') || // ALPHA
		(r >= '0' && r <= '9') || r == '_' // DIGIT | "_"
	return ok
}

// testURIRune tests for URI-safe runes based on RFC 3986.
func testURIRune(r rune) bool {
	// Fast path
	if testASCIIRune(r) {
		return true
	}
	// Exhaustive path
	switch r {
	// https://tools.ietf.org/html/rfc3986#section-2.2
	case ':':
		fallthrough
	case '/':
		fallthrough
	case '?':
		fallthrough
	case '#':
		fallthrough
	case '[':
		fallthrough
	case ']':
		fallthrough
	case '@':
		fallthrough
	case '!':
		fallthrough
	case '$':
		fallthrough
	case '&':
		fallthrough
	case '\'':
		fallthrough
	case '(':
		fallthrough
	case ')':
		fallthrough
	case '*':
		fallthrough
	case '+':
		fallthrough
	case ',':
		fallthrough
	case ';':
		fallthrough
	case '=':
		fallthrough
	// https://tools.ietf.org/html/rfc3986#section-2.3
	case '-':
		fallthrough
	case '.':
		fallthrough
	case '_':
		fallthrough
	case '~':
		return true
	}
	return false
}

func testURI(source string) bool {
	for _, r := range source {
		if !testURIRune(r) {
			return false
		}
	}
	return true
}

// getType gets "static" or "dynamic".
func getType(source string) string {
	parts := strings.Split(source, string(filepath.Separator))
	for _, part := range parts {
		name := part[:len(part)-len(filepath.Ext(part))]
		if strings.HasPrefix(name, "[") && strings.HasSuffix(name, "]") {
			return "dynamic"
		}
	}
	return "static"
}

func getComponentName(source string, typ string) string {
	component := strings.ToUpper(typ[0:1]) + typ[1:]

	basename := source[:len(source)-len(filepath.Ext(source))]

	x := 0
	for _, r := range basename {
		if !testASCIIRune(r) {
			continue
		}
		// Uppercase the start or the start of a part character
		if x == 0 || (x-1 > 0 && basename[x-1] == filepath.Separator) {
			component += strings.ToUpper(string(r))
		} else {
			component += string(r)
		}
		// Increment x on ASCII-safe characters
		x++
	}
	return component
}

func newRoute(dirs DirConfiguration, source string) Route {
	typ := getType(source)

	// Truncate src/pages
	trunc := source[len((dirs.SrcPagesDir + "/")):]
	partial := Route{
		Type:          typ,
		Source:        source,
		ComponentName: getComponentName(trunc, typ),
	}
	return partial
}

// TODO: Add support for ".css", ".scss"?
var supportExts = map[string]bool{
	".js":  true,
	".jsx": true,
	".ts":  true,
	".tsx": true,
}

func newRoutes(dirs DirConfiguration) ([]Route, error) {
	var routes []Route

	var badSources []string
	err := filepath.WalkDir(dirs.SrcPagesDir, func(source string, entry fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		// Ignore non-".js", ".jsx", ".ts", ".tsx"
		if !supportExts[filepath.Ext(source)] {
			return nil
		}

		if !testURI(source) {
			badSources = append(badSources, source)
		} else {
			// Exempt paths that start or end w/ "_" or "$"
			basename := entry.Name()
			name := basename[:len(basename)-len(filepath.Ext(basename))]
			if strings.HasPrefix(name, "_") || strings.HasPrefix(name, "$") {
				return nil
			} else if strings.HasSuffix(name, "_") || strings.HasSuffix(name, "$") {
				return nil
			}
			routes = append(routes, newRoute(dirs, source))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if len(badSources) > 0 {
		// TODO
	}
	return routes, nil
}

func newRuntime() (Runtime, error) {
	runtime := Runtime{
		Dirs: DirConfiguration{
			WwwDir:      "www",
			SrcPagesDir: "src/pages",
			CacheDir:    "__cache__",
			ExportDir:   "__export__",
		},
	}

	// Parse '% retro ...'
	var err error
	runtime.Cmd, err = cli.ParseCLIArguments()
	if err != nil {
		return Runtime{}, err
	}

	// Read www/index.html
	index_html := filepath.Join(runtime.Dirs.WwwDir, "index.html")
	if _, err := os.Stat(index_html); os.IsNotExist(err) {
		if err := os.MkdirAll(filepath.Dir(index_html), MODE_DIR); err != nil {
			return Runtime{}, err
		}
		err := ioutil.WriteFile(index_html,
			[]byte(`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<title>Hello, world!</title>
	</head>
	<body></body>
</html>
`), MODE_FILE)
		if err != nil {
			return Runtime{}, err
		}
	}
	tmpl, err := ioutil.ReadFile(index_html)
	if err != nil {
		return Runtime{}, err
	}

	// Check %head%
	if !bytes.Contains(tmpl, []byte("%head%")) {
		return Runtime{}, newTemplateError(index_html + `: Add '%head%' somewhere to '<head>'.

For example:

` + dim(`// `+index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + terminal.Magenta.Sprint("%head%") + `
		` + dim("...") + `
	</head>
	<body>
		` + dim("...") + `
	</body>
</html>
`)
	}

	// Check %app%
	if !bytes.Contains(tmpl, []byte("%app%")) {
		return Runtime{}, newTemplateError(index_html + `: Add '%app%' somewhere to '<body>'.

For example:

` + dim(`// `+index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + dim("...") + `
	</head>
	<body>
		` + terminal.Magenta.Sprint("%app%") + `
		` + dim("...") + `
	</body>
</html>
`)
	}

	runtime.Template = string(tmpl)

	// Remove __cache__, __export__
	rmdirs := []string{runtime.Dirs.CacheDir, runtime.Dirs.ExportDir}
	for _, rmdir := range rmdirs {
		if err := os.RemoveAll(rmdir); err != nil {
			return Runtime{}, err
		}
	}

	// Create www, src/pages, __cache__, __export__
	mkdirs := []string{runtime.Dirs.WwwDir, runtime.Dirs.SrcPagesDir, runtime.Dirs.CacheDir, runtime.Dirs.ExportDir}
	for _, mkdir := range mkdirs {
		if err := os.MkdirAll(mkdir, MODE_DIR); err != nil {
			return Runtime{}, err
		}
	}

	// Copy www to __export__
	excludes := []string{index_html}
	if err := copyDir(runtime.Dirs.WwwDir, runtime.Dirs.ExportDir, excludes); err != nil {
		return Runtime{}, err
	}

	// Read src/pages
	runtime.Routes, err = newRoutes(runtime.Dirs)
	if err != nil {
		return Runtime{}, err
	}

	return runtime, nil
}

func (r Runtime) Dev() {
	//////////////////////////////////////////////////////////////////////////////
	// Server API

	stdin, stdout, stderr, err := runNodeBackend(filepath.Join("scripts", "node_backend.esbuild.js"))
	if err != nil {
		panic(err)
	}

	defer func() {
		stdin <- StdinMessage{Kind: "done"}
		close(stdin)
	}()

	// Stream routes
	stdin <- StdinMessage{Kind: "resolve_router", Data: r}

	var one time.Time
	sum := time.Now()

loop:
	for {
		select {
		case msg := <-stdout:
			if msg.Kind == "eof" {
				break loop
			}
			switch msg.Kind {
			case "start":
				one = time.Now() // Start
			case "server_route":
				var srvRoute ServerRoute
				if err := json.Unmarshal(msg.Data, &srvRoute); err != nil {
					panic(err)
				}
				logger2.Stdout(prettyServerRoute(r.Dirs, srvRoute, time.Since(one)))
				one = time.Now() // Reset
			case "server_router":
				if err := json.Unmarshal(msg.Data, &r.SrvRouter); err != nil {
					panic(err)
				}
			default:
				panic("Internal error")
			}
		case err := <-stderr:
			logger2.Stderr(err)
			os.Exit(1)
		}
	}

	fmt.Println()
	fmt.Println(" " + dim(`(`+prettyDuration(time.Since(sum))+`)`))
	fmt.Println()

	//////////////////////////////////////////////////////////////////////////////
	// Server router contents

	stdin <- StdinMessage{Kind: "server_router_contents", Data: r.SrvRouter}
	msg := <-stdout
	var contents string
	if err := json.Unmarshal(msg.Data, &contents); err != nil {
		panic(err)
	}

	if err := ioutil.WriteFile(filepath.Join(r.Dirs.CacheDir, "app.js"), []byte(contents), MODE_FILE); err != nil {
		panic(err)
	}

	//////////////////////////////////////////////////////////////////////////////
	// Dev server

	type result struct {
		Errors   []api.Message
		Warnings []api.Message
	}

	type ServeRouteContents struct {
		Head string // %head%
		App  string // %app%
	}

	dev := make(chan result, 16)
	out := make(chan string)

	go func() {
		stdin <- StdinMessage{Kind: "dev_server", Data: r}

		for {
			select {
			case msg := <-stdout:
				switch msg.Kind {
				case "build":
					var res result
					if err := json.Unmarshal(msg.Data, &res); err != nil {
						panic(err)
					}
					fmt.Println(res) // DEBUG
					dev <- res
				case "rebuild":
					var res result
					if err := json.Unmarshal(msg.Data, &res); err != nil {
						panic(err)
					}
					fmt.Println(res) // DEBUG
					dev <- res
				case "server_route_contents":
					var contents ServeRouteContents
					if err := json.Unmarshal(msg.Data, &contents); err != nil {
						panic(err)
					}
					html := r.Template
					html = strings.Replace(html, "%head%", contents.Head, 1)
					html = strings.Replace(html, "%app%", contents.App, 1)
					out <- html
				default:
					panic("Internal error")
				}
			case err := <-stderr:
				logger2.Stderr(err)
				// os.Exit(1)
			}
		}
	}()

	getPathname := func(rq *http.Request) string {
		pathname := rq.URL.Path
		if strings.HasSuffix(rq.URL.Path, "/index.html") {
			pathname = pathname[:len(pathname)-len("index.html")] // Keep "/"
		} else if ext := filepath.Ext(rq.URL.Path); ext == ".html" {
			pathname = pathname[:len(pathname)-len(".html")]
		}
		return pathname
	}

	getFSPathname := func(rq *http.Request) string {
		pathname := rq.URL.Path
		if strings.HasSuffix(rq.URL.Path, "/") {
			pathname += "index.html"
		} else if ext := filepath.Ext(rq.URL.Path); ext == "" {
			pathname += ".html"
		}
		return pathname
	}

	serveEvent := func(pathname string, statusCode int, dur time.Duration) {
		logger2.Stdout(prettyServeEvent(ServeArgs{
			Path:       pathname,
			StatusCode: statusCode,
			Duration:   dur,
		}))
	}

	// ~/dev; sever-sent events
	http.HandleFunc("/~dev", func(w http.ResponseWriter, rq *http.Request) {
		// Set SSE headers
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, _ := w.(http.Flusher)
		for {
			select {
			case <-dev:
				fmt.Fprintf(w, "event: reload\ndata\n\n")
				flusher.Flush()
			case <-rq.Context().Done():
				return
			}
		}
	})

	// __export__
	http.HandleFunc("/", func(w http.ResponseWriter, rq *http.Request) {
		var (
			start       = time.Now()
			pathname    = getPathname(rq)
			fs_pathname = getFSPathname(rq)
		)

		// Not found; 404
		srvRoute, ok := r.SrvRouter[pathname]
		if !ok {
			http.NotFound(w, rq)
			serveEvent(pathname, 404, time.Since(start))
			return
		}
		// Found; 200
		stdin <- StdinMessage{Kind: "server_route_contents", Data: srvRoute}
		html := <-out
		if err := os.MkdirAll(filepath.Dir(srvRoute.Route.Target), MODE_DIR); err != nil {
			panic(err)
		}
		if err := ioutil.WriteFile(srvRoute.Route.Target, []byte(html), MODE_FILE); err != nil {
			panic(err)
		}
		fmt.Fprintln(w, html)
		serveEvent(fs_pathname, 200, time.Since(start))
	})

	// Serve __export__/app.js
	http.HandleFunc("/app.js", func(w http.ResponseWriter, rq *http.Request) {
		var (
			start = time.Now()
			// pathname    = "/app"
			fs_pathname = "/app.js"
		)

		http.ServeFile(w, rq, filepath.Join(r.Dirs.ExportDir, fs_pathname))
		serveEvent(fs_pathname, 200, time.Since(start))
	})

	// Serve __export__/www (use path.Join not filepath.Join)
	http.HandleFunc(path.Join("/"+r.Dirs.WwwDir), func(w http.ResponseWriter, rq *http.Request) {
		var (
			start = time.Now()
			// pathname    = getPathname(rq)
			fs_pathname = getFSPathname(rq)
		)

		http.ServeFile(w, rq, filepath.Join(r.Dirs.ExportDir, r.Dirs.ExportDir, fs_pathname))
		serveEvent("/test", 404, time.Since(start))
	})

	port := r.getPort()
	logger.OK(fmt.Sprintf("Ready on port '%s'", port))
	if err := http.ListenAndServe(":"+port, nil); err != nil {
		panic(err)
	}
}

func (r Runtime) Export() {
	fmt.Println("TODO")
}

func (r Runtime) Serve() {
	fmt.Println("TODO")
}

func main() {
	defer terminal.Revert(os.Stdout)

	runtime, err := newRuntime()
	switch err.(type) {
	case cli.CmdError:
		logger.FatalError(err)
	case templateError:
		logger.FatalError(err)
	default:
		must(err)
	}

	switch kind := runtime.getCmdKind(); kind {
	case Dev:
		runtime.Dev()
	case Export:
		runtime.Export()
	case Serve:
		runtime.Serve()
	}
}
