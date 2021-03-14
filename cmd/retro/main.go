package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/fs"
	"io/ioutil"
	"os"
	"path/filepath"
	"strings"

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

	// Truncate ".js", ".jsx", ".ts", ".tsx"
	trunc := source[:len(source)-len(filepath.Ext(source))]
	for x, r := range trunc {
		// Ignore ASCII-unsafe characters
		if !testASCIIRune(r) {
			continue
		}
		// Uppercase the start or the start of a part character
		if x == 0 || (x-1 > 0 && trunc[x-1] == filepath.Separator) {
			component += strings.ToUpper(string(r))
		} else {
			component += string(r)
		}
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
		if err := os.MkdirAll(filepath.Dir(index_html), PERM_DIR); err != nil {
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
`), PERM_FILE)
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

` + terminal.Dim.Sprint(`// `+index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + terminal.Magenta.Sprint("%head%") + `
		` + terminal.Dim.Sprint("...") + `
	</head>
	<body>
		` + terminal.Dim.Sprint("...") + `
	</body>
</html>
`)
	}

	// Check %app%
	if !bytes.Contains(tmpl, []byte("%app%")) {
		return Runtime{}, newTemplateError(index_html + `: Add '%app%' somewhere to '<body>'.

For example:

` + terminal.Dim.Sprint(`// `+index_html) + `
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		` + terminal.Dim.Sprint("...") + `
	</head>
	<body>
		` + terminal.Magenta.Sprint("%app%") + `
		` + terminal.Dim.Sprint("...") + `
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
		if err := os.MkdirAll(mkdir, PERM_DIR); err != nil {
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
	stdin, stdout, stderr, err := node(filepath.Join("cmd", "retro", "js", "node.mjs"))
	must(err)

	stdin <- IncomingMessage{Kind: "foo", Data: JSON{"foo": "bar"}}
	select {
	case msg := <-stdout:
		bstr, _ := json.Marshal(msg)
		logger2.Stdout(string(bstr))
	case str := <-stderr:
		logger2.Stderr(str)
		os.Exit(1)
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

	// bstr, _ := json.MarshalIndent(runtime, "", "\t")
	// fmt.Println(string(bstr))
}
