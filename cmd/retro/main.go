package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"html"
	"io/fs"
	"io/ioutil"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/ipc"
	"github.com/zaydek/retro/pkg/logger"
	"github.com/zaydek/retro/pkg/stdio_logger"
	"github.com/zaydek/retro/pkg/terminal"
	"github.com/zaydek/retro/pkg/watch"
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
// 		${src}: Add '%body%' somewhere to '<body>'.
//
// 		For example:
//
// 		${terminal.dim(`// ${src}`)}
// 		<!DOCTYPE html>
// 			<head lang="en">
// 				${terminal.dim("...")}
// 			</head>
// 			<body>
// 				${terminal.magenta("%body%")}
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
	name := strings.ToUpper(typ[0:1]) + typ[1:]
	basename := source[:len(source)-len(filepath.Ext(source))]

	x := 0
	for _, r := range basename {
		if !testASCIIRune(r) {
			continue
		}
		// Uppercase the start or the start of a part character
		if x == 0 || basename[x] == filepath.Separator {
			name += strings.ToUpper(string(r))
		} else {
			name += string(r)
		}
		// Increment x on ASCII-safe characters
		x++
	}
	return name
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

` + terminal.Dimf(`// %s`, index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + terminal.Magenta("%head%") + `
		` + terminal.Dim("...") + `
	</head>
	<body>
		` + terminal.Dim("...") + `
	</body>
</html>
`)
	}

	// Check %body%
	if !bytes.Contains(tmpl, []byte("%body%")) {
		return Runtime{}, newTemplateError(index_html + `: Add '%body%' somewhere to '<body>'.

For example:

` + terminal.Dimf(`// %s`, index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + terminal.Dim("...") + `
	</head>
	<body>
		` + terminal.Magenta("%body%") + `
		` + terminal.Dim("...") + `
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

type BuildResponse struct {
	Errors   []api.Message
	Warnings []api.Message
}

func (r BuildResponse) Dirty() bool {
	return len(r.Errors) > 0 || len(r.Warnings) > 0
}

type MessageKind int

const (
	Error MessageKind = iota
	Warning
)

func getPos(x interface{}, offset int) string {
	switch y := x.(type) {
	case api.Message:
		return fmt.Sprintf("%s:%d:%d", y.Location.File, y.Location.Line, y.Location.Column+offset)
	case api.Note:
		return fmt.Sprintf("%s:%d:%d", y.Location.File, y.Location.Line, y.Location.Column+offset)
	}
	panic("Internal error")
}

func getVSCodePos(x interface{}) string {
	cwd, _ := os.Getwd()
	switch y := x.(type) {
	case api.Message:
		return fmt.Sprintf("vscode://file%s/%s", cwd, getPos(y, 1))
	case api.Note:
		return fmt.Sprintf("vscode://file%s/%s", cwd, getPos(y, 1))
	}
	panic("Internal error")
}

func formatMessage(m api.Message, kind MessageKind) string {
	var class, typ string
	switch kind {
	case Error:
		class = "red"
		typ = "error"
	case Warning:
		class = "yellow"
		typ = "warning"
	}

	// lineText := strings.ReplaceAll(m.Location.LineText, "\t", "  ")

	tabLen := func(str string) int {
		var len int
		for _, ch := range str {
			if ch == '\t' {
				len += 2
				continue
			}
			len++
		}
		return len
	}

	focus := "^"
	if m.Location.Length > 0 { // FIXME
		focus = strings.Repeat("~", m.Location.Length)
	}

	var str string
	str += fmt.Sprintf(`<strong class="bold"> &gt; <a href="%s">%s</a>: <span class="%s">%s:</span> %s</strong>
    %d │ %s<span class="focus">%s</span>%s
    %s | %s<span class="focus">%s</span>
`,
		getVSCodePos(m),
		getPos(m, 0),
		class,
		typ,
		m.Text,
		m.Location.Line,
		html.EscapeString(m.Location.LineText[:m.Location.Column]),
		html.EscapeString(m.Location.LineText[m.Location.Column:m.Location.Column+m.Location.Length]),
		html.EscapeString(m.Location.LineText[m.Location.Column+m.Location.Length:]),
		strings.Repeat(" ", len(strconv.Itoa(m.Location.Line))),
		strings.Repeat(" ", tabLen(m.Location.LineText[:m.Location.Column])),
		focus,
	)
	if len(m.Notes) > 0 {
		for _, n := range m.Notes {

			focus := "^"
			if n.Location.Length > 0 { // FIXME
				focus = strings.Repeat("~", n.Location.Length)
			}

			str += fmt.Sprintf(`   <a href="%s">%s</a>: <span class="bold">note:</span> %s
    %d │ %s<span class="focus">%s</span>%s
    %s | %s<span class="focus">%s</span>
`,
				getVSCodePos(n),
				getPos(n, 0),
				n.Text,
				n.Location.Line,
				html.EscapeString(n.Location.LineText[:n.Location.Column]),
				html.EscapeString(n.Location.LineText[n.Location.Column:n.Location.Column+n.Location.Length]),
				html.EscapeString(n.Location.LineText[n.Location.Column+n.Location.Length:]),
				strings.Repeat(" ", len(strconv.Itoa(n.Location.Line))),
				strings.Repeat(" ", tabLen(n.Location.LineText[:n.Location.Column])),
				focus,
			)
		}
	}
	str = strings.ReplaceAll(str, "\t", "  ")
	return str
}

func (r BuildResponse) HTML() string {
	var body string

	for _, msg := range r.Errors {
		if body != "" {
			body += "<br>"
		}
		body += `<pre><code>` + formatMessage(msg, Error) + `</code></pre>`
	}

	for _, msg := range r.Warnings {
		if body != "" {
			body += "<br>"
		}
		body += `<pre><code>` + formatMessage(msg, Warning) + `</code></pre>`
	}

	return `<!DOCTYPE html>
<html>
	<head>
		<title>` + fmt.Sprintf("Error: %s", r.Errors[0].Text) + `</title>
		<style>

*,
*::before,
*::after {
	/* Zero-out margin and padding */
	margin: 0;
	padding: 0;

	/* Reset border-box */
  box-sizing: border-box;
}

:root {
	--font-size: 14px;

	--color: #c7c7c7;
	--bg: #000000;

	--bold: #feffff;
	--red: #ff6d67;
	--yellow: #fefb67;
	--focus: #00c200;
}

body {
  color: #c7c7c7;
  background-color: #000000;
}

.terminal {
	padding: var(--font-size);
}

code {
	font: var(--font-size) / calc(1.5 * var(--font-size)) "Monaco", monospace;
}

a { color: unset; text-decoration: unset; }
a:hover { text-decoration: underline; }

.bold { color: var(--bold); }
.red { color: var(--red); }
.yellow { color: var(--yellow); }
.focus { color: var(--focus); }

		</style>
	</head>
	<body>
		<div class="terminal">` + body + `</div>
		<script type="module">const dev = new EventSource("/~dev"); dev.addEventListener("reload", () => { localStorage.setItem("/~dev", "" + Date.now()); window.location.reload() }); dev.addEventListener("error", e => { try { console.error(JSON.parse(e.data)) } catch {} }); window.addEventListener("storage", e => { if (e.key === "/~dev") { window.location.reload() } })</script>
	</body>
</html>
`
}

func (r Runtime) Dev() {
	stdin, stdout, stderr, err := ipc.NewCommand("node", filepath.Join("scripts", "backend.esbuild.js"))
	if err != nil {
		panic(err)
	}
	defer close(stdin)

	service := ipc.Service{Stdin: stdin, Stdout: stdout, Stderr: stderr}

	//////////////////////////////////////////////////////////////////////////////
	// Server API

	stdin <- ipc.RequestMessage{Kind: "resolve_server_router", Data: r}

	// fmt.Println()
	// logger.OK("'serverProps' and 'serverPaths'…")

	// var start, once time.Time
	var once time.Time
loop:
	for {
		select {
		case msg := <-stdout:
			switch msg.Kind {
			case "once":
				// start, once = time.Now(), time.Now() // Start
				once = time.Now() // Start
			case "server_route":
				var srvRoute ServerRoute
				if err := json.Unmarshal(msg.Data, &srvRoute); err != nil {
					panic(err)
				}
				stdio_logger.Stdout(prettyServerRoute(r.Dirs, srvRoute, time.Since(once)))
				once = time.Now() // Reset
			case "eof":
				if err := json.Unmarshal(msg.Data, &r.SrvRouter); err != nil {
					panic(err)
				}
				fmt.Println()
				// fmt.Println(terminal.Dimf("(%s)", prettyDuration(time.Since(start))))
				fmt.Println(terminal.Dim("---"))
				fmt.Println()
				break loop
			default:
				panic("Internal error")
			}
		case err := <-stderr:
			stdio_logger.Stderr(err)
			os.Exit(1)
		}
	}

	//////////////////////////////////////////////////////////////////////////////
	// Server router contents

	var contents string
	if stderr, err := service.Send(ipc.RequestMessage{Kind: "server_router_string", Data: r}, &contents); err != nil {
		panic(err)
	} else if stderr != "" {
		stdio_logger.Stderr(err)
		os.Exit(1)
	}

	if err := ioutil.WriteFile(filepath.Join(r.Dirs.CacheDir, "app.js"), []byte(contents), MODE_FILE); err != nil {
		panic(err)
	}

	//////////////////////////////////////////////////////////////////////////////
	// Dev server

	// Browser server-sent events
	var res BuildResponse
	browser := make(chan BuildResponse, 1)

	go func() {
		for event := range watch.Directory(r.Dirs.SrcPagesDir, 100*time.Millisecond) {
			if event.Err != nil {
				panic(event.Err)
			}
			// Send a message for 'esbuild.rebuild()'
			if stderr, err := service.Send(ipc.RequestMessage{Kind: "rebuild"}, &res); err != nil {
				panic(err)
			} else if stderr != "" {
				// bstr, _ := json.Marshal(res)
				// fmt.Println(string(bstr))
				stdio_logger.Stderr(stderr) // TODO
			}
			browser <- res
		}
	}()

	// Send a message for 'esbuild.build({ ... })'
	if stderr, err := service.Send(ipc.RequestMessage{Kind: "build", Data: r}, &res); err != nil {
		panic(err)
	} else if stderr != "" {
		// stdio_logger.Stderr(stderr)
	}
	browser <- res

	type Data struct {
		Runtime     Runtime
		ServerRoute ServerRoute
	}

	http.HandleFunc("/", func(w http.ResponseWriter, req *http.Request) {
		var (
			start        = time.Now()
			sys_pathname = getSystemPathname(req.URL.Path)
		)
		// Server error (500)
		if res.Dirty() {
			fmt.Fprintln(w, res.HTML())
			return
		}
		// Bad request (404)
		srvRoute, ok := r.SrvRouter[getPathname(req.URL.Path)]
		if !ok {
			http.NotFound(w, req)
			logServeEvent404(sys_pathname, start)
			return
		}
		// OK (200)
		var contents string
		if stderr, err := service.Send(ipc.RequestMessage{Kind: "server_route_string", Data: Data{Runtime: r, ServerRoute: srvRoute}}, &contents); err != nil {
			panic(err)
		} else if stderr != "" {
			stdio_logger.Stderr(stderr)           // TODO
			logServeEvent500(sys_pathname, start) // TODO
			return
		}
		if err := os.MkdirAll(filepath.Dir(srvRoute.Route.Target), MODE_DIR); err != nil {
			panic(err)
		}
		if err := ioutil.WriteFile(srvRoute.Route.Target, []byte(contents), MODE_FILE); err != nil {
			panic(err)
		}
		fmt.Fprintln(w, contents)
		logServeEvent200(sys_pathname, start)
	})

	app := func(w http.ResponseWriter, req *http.Request) {
		var (
			start       = time.Now()
			fs_pathname = getSystemPathname(req.URL.Path)
		)
		// Bad request (404)
		target := filepath.Join(r.Dirs.ExportDir, fs_pathname)
		if _, err := os.Stat(target); os.IsNotExist(err) {
			http.NotFound(w, req)
			logServeEvent404(fs_pathname, start)
			return
		}
		// OK (200)
		http.ServeFile(w, req, target)
		logServeEvent200(fs_pathname, start)
	}

	http.HandleFunc("/app.js", app)
	http.HandleFunc("/app.js.map", app)

	http.HandleFunc("/"+r.Dirs.WwwDir, func(w http.ResponseWriter, req *http.Request) {
		var (
			start       = time.Now()
			fs_pathname = getSystemPathname(req.URL.Path)
		)
		// Bad request (404)
		target := filepath.Join(r.Dirs.ExportDir, r.Dirs.ExportDir, fs_pathname)
		if _, err := os.Stat(target); os.IsNotExist(err) {
			http.NotFound(w, req)
			logServeEvent404(fs_pathname, start)
			return
		}
		// OK (200)
		http.ServeFile(w, req, target)
		logServeEvent200(fs_pathname, start)
	})

	http.HandleFunc("/~dev", func(w http.ResponseWriter, req *http.Request) {
		// Set server-sent event headers
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		w.Header().Set("Connection", "keep-alive")
		flusher, ok := w.(http.Flusher)
		if !ok {
			panic("Internal error")
		}
		for {
			select {
			case res := <-browser:
				bstr, err := json.Marshal(res)
				if err != nil {
					panic(err)
				}
				fmt.Fprint(w, `event: reload`+"\n"+`data: %s`+"\n\n", string(bstr))
				flusher.Flush()
			case <-req.Context().Done():
				return
			}
		}
	})

	port := r.getPort()
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
		if err != nil {
			panic(err)
		}
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
