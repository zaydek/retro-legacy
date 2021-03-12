package main

import (
	"encoding/json"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"strings"

	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/logger"
	"github.com/zaydek/retro/pkg/terminal"
)

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

// func getName(source string) string {
// 	basename := filepath.Base(source)
// 	name := basename[:len(basename)-len(filepath.Ext(basename))]
// 	return name
// }

// getSourceType gets "static" or "dynamic".
func getSourceType(source string) string {
	parts := strings.Split(source, string(filepath.Separator))
	for _, part := range parts {
		name := part[:len(part)-len(filepath.Ext(part))]
		if strings.HasPrefix(name, "[") && strings.HasSuffix(name, "]") {
			return "dynamic"
		}
	}
	return "static"
}

func getComponentSyntax(source string, typ string) string {
	component := strings.ToUpper(typ[0:1]) + typ[1:]
	for x, r := range source {
		// Ignore ASCII-unsafe characters
		if !testASCIIRune(r) {
			continue
		}
		// Uppercase the start or the start of a part character
		if x == 0 || (x-1 > 0 && source[x-1] == filepath.Separator) {
			component += strings.ToUpper(string(r))
		} else {
			component += string(r)
		}
	}
	return component
}

func newRoutePartial(dirs DirConfiguration, source string) RoutePartial {
	typ := getSourceType(source)

	// Truncate src/pages
	source = source[len((dirs.SrcPagesDir + "/")):]
	partial := RoutePartial{
		Type:            typ,
		Source:          source,
		ComponentSyntax: getComponentSyntax(source, typ),
	}
	return partial
}

var supportExts = map[string]bool{
	".js":  true,
	".jsx": true,
	".ts":  true,
	".tsx": true,
}

func newRoutePartialsFromDirs(dirs DirConfiguration) ([]RoutePartial, error) {
	partials := []RoutePartial{}

	badSources := []string{}
	err := filepath.WalkDir(dirs.SrcPagesDir, func(source string, d fs.DirEntry, err error) error {
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
			name := d.Name()
			if strings.HasPrefix(name, "_") || strings.HasPrefix(name, "$") {
				return nil
			} else if strings.HasSuffix(name, "_") || strings.HasSuffix(name, "$") {
				return nil
			}
			partials = append(partials, newRoutePartial(dirs, source))
		}
		return nil
	})
	if err != nil {
		return nil, err
	}

	if len(badSources) > 0 {
		// TODO
	}
	return partials, nil
}

func newRuntime() (Runtime, error) {
	rt := Runtime{
		Dirs: DirConfiguration{
			WwwDir:      "www",
			SrcPagesDir: "src/pages",
			CacheDir:    "__cache__",
			ExportDir:   "__export__",
		},
	}

	// Parse '% retro ...'
	var err error
	rt.Cmd, err = cli.ParseCLIArguments()
	if err != nil {
		return Runtime{}, err
	}

	// Remove __cache__, __export__
	rmdirs := []string{rt.Dirs.CacheDir, rt.Dirs.ExportDir}
	for _, rmdir := range rmdirs {
		if err := os.RemoveAll(rmdir); err != nil {
			return Runtime{}, err
		}
	}

	// Create www, src/pages, __cache__, __export__
	mkdirs := []string{rt.Dirs.WwwDir, rt.Dirs.SrcPagesDir, rt.Dirs.CacheDir, rt.Dirs.ExportDir}
	for _, mkdir := range mkdirs {
		if err := os.MkdirAll(mkdir, PERM_DIR); err != nil {
			return Runtime{}, err
		}
	}

	// Copy www to __export__
	excludes := []string{filepath.Join(rt.Dirs.WwwDir, "index.html")}
	if err := copyDir(rt.Dirs.WwwDir, rt.Dirs.ExportDir, excludes); err != nil {
		return Runtime{}, err
	}

	// Read src/pages
	rt.RoutePartials, err = newRoutePartialsFromDirs(rt.Dirs)
	if err != nil {
		return Runtime{}, err
	}

	return rt, nil
}

func (r Runtime) DevCmd() {
	// ...
}

func (r Runtime) ExportCmd() {
	// ...
}

// func (r Runtime) ServeCmd() {
// 	if _, err := os.Stat(r.Dirs.ExportDir); os.IsNotExist(err) {
// 		// "App unexported; try 'retro export && retro serve'."
// 	}
//
// 	go func() {
// 		time.Sleep(100 * time.Millisecond)
// 		// fmt.Println(fmt.Sprintf("📡 Serving on port %[1]s; http://localhost:%[1]s", r.getPort()))
// 	}()
//
// 	// http.HandleFunc("/", func(wr http.ResponseWriter, req *http.Request) {
// 	// 	pathname := req.URL.Path
// 	// 	if p.Ext(pathname) == "" {
// 	// 		if strings.HasSuffix(pathname, "/") {
// 	// 			pathname += "index.html"
// 	// 		} else {
// 	// 			pathname += ".html"
// 	// 		}
// 	// 	}
// 	// 	http.ServeFile(wr, req, filepath.Join(r.Dirs.ExportDir, pathname))
// 	// })
// 	if err := http.ListenAndServe(":"+r.getPort(), nil); err != nil {
// 		// loggers.ErrorAndEnd("An unexpected error occurred.\n\n" +
// 		// 	err.Error())
// 	}
// }

var (
	boldf = terminal.Bold.Sprintf
	red   = terminal.Red.Sprint
)

func main() {
	runtime, err := newRuntime()
	if err != nil {
		logger.Error(err)
		os.Exit(1)
	}
	bstr, _ := json.MarshalIndent(runtime, "", "\t")
	fmt.Println(string(bstr))
}
