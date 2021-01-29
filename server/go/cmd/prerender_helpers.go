package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"strings"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/errs"
	"github.com/zaydek/retro/mode"
)

// TODO: Can we embed PageBasedRoute here and simply add Head and Page?
type prerenderedPage struct {
	FSPath string `json:"fs_path"`

	// TODO
	DiskPathSrc string `json:"diskPathSrc"`
	DiskPathDst string `json:"diskPathDst"`
	Path        string `json:"path"`
	Head        string `json:"head"`
	Page        string `json:"page"`
}

// buildRequireStmt builds a require statement for Node processes.
func buildRequireStmt(routes []PageBasedRoute) string {
	var requireStmt string
	for x, each := range routes {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requireStmt += sep + fmt.Sprintf(`const %s = require("../%s")`,
			each.Component, each.FSPath)
	}
	return requireStmt
}

// buildRequireStmtAsArray builds a require statement as an array for Node
// processes.
func buildRequireStmtAsArray(routes []PageBasedRoute) string {
	var requireStmtAsArray string
	for _, each := range routes {
		requireStmtAsArray += "\n\t" + fmt.Sprintf(`{ fs_path: %q, path: %q, exports: %s },`,
			each.FSPath, each.Path, each.Component)
	}
	requireStmtAsArray = "[" + requireStmtAsArray + "\n]"
	return requireStmtAsArray
}

// parseBaseHTMLTemplate parses public/index.html as a text/template template.
func (r Runtime) parseBaseHTMLTemplate() (*template.Template, error) {
	bstr, err := ioutil.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"))
	if err != nil {
		return nil, errs.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return nil, errors.New("No such template tag " + color.Bold("{{ .Head }}") + ". " +
			"This is the entry point for the " + color.Bold("<Head>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Head }}") + " to " + color.Bold("<head>") + ".")
	} else if !strings.Contains(text, "{{ .Page }}") {
		return nil, errors.New("No such template tag " + color.Bold("{{ .Page }}") + ". " +
			"This is the entry point for the " + color.Bold("<Page>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Page }}") + " to " + color.Bold("<body>") + ".")
	}

	base, err := template.New(p.Join(r.Config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return nil, errs.ParseTemplate(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}
	return base, nil
}

// TODO: May want to add some kind of scroll-restoration logic for SSE as well
// as disconnected SSE to stop retrying. Can try retry -1 for example.
func (r Runtime) prerenderPage(base *template.Template, route PageBasedRoute) ([]byte, error) {
	if _, err := os.Stat(p.Join(r.Config.CacheDirectory, "props.js")); os.IsNotExist(err) {
		return nil, errors.New("It looks like your loaders have not been resolved yet. " +
			"Remove " + color.Bold("--cached") + " and try again.")
	}

	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

` + fmt.Sprintf(`const %s = require("../%s")`, route.Component, route.FSPath) + `
const props = require("../` + r.Config.CacheDirectory + `/props.js").default

function run({ path, Head, Page, ...etc }) {
	let head = ""
	if (Head) {
		head = ReactDOMServer.renderToStaticMarkup(
			<Head {...props[path]} />
		)
	}
	head = head
		.replace(/></g, ">\n\t\t<")
		.replace(/\/>/g, " />")

	let page = '<div id="root"></div>'
	if (Page) {
		page = ReactDOMServer.renderToString(
			<div id="root">
				<Page {...props[path]} />
			</div>
		)
	}

	page += '\n'
	page += '		<script src="/app.js"></script>\n'
	page += '		<script>\n'
	page += '			const __retro_sse__ = new EventSource("/sse")\n'
	page += '			__retro_sse__.addEventListener("reload", e => window.location.reload())\n'
	page += '			__retro_sse__.addEventListener("warning", e => console.warn(JSON.parse(e.data)))\n'
	page += '		</script>'

	console.log(JSON.stringify({ ...etc, head, page }))
}

run(` + fmt.Sprintf(`{
	diskPathSrc: %q,
	diskPathDst: %q,
	path: %q,
	Head: %[4]s.Head,
	Page: %[4]s.default,
}`, route.DiskPathSrc, route.DiskPathDst, route.Path, route.Component) + `)
`

	if err := ioutil.WriteFile(p.Join(r.Config.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component)), []byte(text), mode.File); err != nil {
		return nil, errs.WriteFile(p.Join(r.Config.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component)), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{p.Join(r.Config.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component))},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})

	// TODO
	if len(results.Warnings) > 0 {
		return nil, errors.New(formatEsbuildMessagesAsTermString(results.Warnings))
	}
	if len(results.Errors) > 0 {
		return nil, errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	// TODO: It would also be nice if we can automatically unmarshal the return nil, of
	// Node since we’re only using Node for IPC processes.
	var page prerenderedPage
	stdoutBuf, err := execNode(results.OutputFiles[0].Contents)
	if err != nil {
		return nil, err
	}

	if err := json.Unmarshal(stdoutBuf.Bytes(), &page); err != nil {
		return nil, errs.Unexpected(err)
	}

	var buf bytes.Buffer
	if err := base.Execute(&buf, page); err != nil {
		return nil, errs.ExecuteTemplate(fmt.Sprintf("<%s:%s>", base.Name(), route.Component), err)
	}

	return buf.Bytes(), nil

	// // TODO: Can we combine these functions?
	// if err := os.MkdirAll(p.Dir(page.DiskPathDst), mode.Directory); err != nil {
	// 	return errs.MkdirAll(p.Dir(page.DiskPathDst), err)
	// } else if err := ioutil.WriteFile(page.DiskPathDst, buf.Bytes(), mode.File); err != nil {
	// 	return errs.WriteFile(page.DiskPathDst, err)
	// }
	// return nil
}
