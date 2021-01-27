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
)

type prerenderedPage struct {
	FSPath string `json:"fs_path"`
	Path   string `json:"path"`
	Head   string `json:"head"`
	Page   string `json:"page"`
}

func (r Runtime) prerenderPages() error {
	bstr, err := ioutil.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"))
	if err != nil {
		return errs.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return errors.New("No such template tag " + color.Bold("{{ .Head }}") + ". " +
			"This is the entry point for the " + color.Bold("<Head>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Head }}") + " to " + color.Bold("<head>") + ".")
	} else if !strings.Contains(text, "{{ .Page }}") {
		return errors.New("No such template tag " + color.Bold("{{ .Page }}") + ". " +
			"This is the entry point for the " + color.Bold("<Page>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Page }}") + " to " + color.Bold("<body>") + ".")
	}

	tmpl, err := template.New(p.Join(r.Config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return errs.ParseTemplate(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}

	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + buildRequireStmt(r.Router) + `

// Props
const props = require("../` + r.Config.CacheDirectory + `/props.js").default

async function asyncRun(requireStmtAsArray) {
	const chain = []
	for (const { fs_path, path, exports } of requireStmtAsArray) {
		const promise = new Promise(async resolve => {
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
			page += '\n\t\t<script src="/app.js"></script>'

			resolve({ fs_path, path, head, page })
		})
		chain.push(promise)
	}
	const resolvedAsArr = await Promise.all(chain)
	console.log(JSON.stringify(resolvedAsArr, null, 2))
}

asyncRun(` + buildRequireStmtAsArray(r.Router) + `)
`

	if err := ioutil.WriteFile(p.Join(r.Config.CacheDirectory, "pages.esbuild.js"), []byte(rawstr), 0644); err != nil {
		return errs.WriteFile(p.Join(r.Config.CacheDirectory, "pages.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{p.Join(r.Config.CacheDirectory, "pages.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		return errors.New(FormatMessageAsTermString(results.Errors))
	}

	stdoutBuf, err := runNode(results.OutputFiles[0].Contents)
	if err != nil {
		return err
	}

	var pages []prerenderedPage
	if err := json.Unmarshal(stdoutBuf.Bytes(), &pages); err != nil {
		return errs.Unexpected(err)
	}

	for _, each := range pages {
		var path string
		path = each.FSPath[len(r.Config.PagesDirectory):]  // pages/page.js -> page.js
		path = path[:len(path)-len(p.Ext(path))] + ".html" // page.js -> page.html
		path = p.Join(r.Config.BuildDirectory, path)       // page.html -> build/page.html
		if dir := p.Dir(path); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
		var buf bytes.Buffer
		if err := tmpl.Execute(&buf, each); err != nil {
			return errs.ExecuteTemplate(path, err)
		}
		if err := ioutil.WriteFile(path, buf.Bytes(), 0644); err != nil {
			return errs.WriteFile(path, err)
		}
	}
	return nil
}
