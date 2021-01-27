package main

import (
	"errors"
	"fmt"
	"io/ioutil"
	p "path"
	"strings"
	"text/template"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/errs"
)

// var reload = `
// 		<script src="/app.js"></script>
// 		<script>
// 			const source = new EventSource("/sse")
// 			source.addEventListener("reload", e => { window.location.reload() })
// 			source.addEventListener("warning", e => { console.warn(JSON.parse(e.data)) })
// 		</script>
// `

type prerenderedPage struct {
	FSPath string `json:"fs_path"`
	Path   string `json:"path"`
	Head   string `json:"head"`
	Page   string `json:"page"`
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

func (r Runtime) prerenderPage(base *template.Template, route PageBasedRoute) (rendered string, err error) {
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

` + fmt.Sprintf(`const %s = require("../%s).default`, route.Component, route.FSPath) + `
const props = require("../` + r.Config.CacheDirectory + `/props.js").default

function run({ fs_path, path, exports }) {
	const { Head, default: Page } = exports

	// Resolve <Head {...props}>:
	let head = ""
	if (Head) {
		head = ReactDOMServer.renderToStaticMarkup(<Head {...props[path]} />)
	}
	head = head.replace(/></g, ">\n\t\t<")
	head = head.replace(/\/>/g, " />")

	// Resolve <Page {...props}>:
	let page = '<div id="root" data-reactroot=""></div>'
	if (Page) {
		page = ReactDOMServer.renderToString(
			<div id="root">
				<Page {...props[path]} />
			</div>
		)
	}

	resolve({ fs_path, path, head, page })
})

run(` + fmt.Sprintf(`{ fs_path: %q, path: %q, exports: %s }`,
		route.FSPath, route.Path, route.Component) + `)
`
	fmt.Print(text)
	return "", nil
}
