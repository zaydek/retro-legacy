package dev

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"strings"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/run"
)

func (r Runtime) RenderPages() error {
	// TODO: When esbuild adds support for dynamic imports, this can be changed to
	// a pure JavaScript implementation.
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + strings.Join(requires(r.PageBasedRouter), "\n") + `

// Props
` + fmt.Sprintf(`const props = require("%s").default, ../`+r.DirConfiguration.CacheDirectory+"/props.js") + `

async function asyncRun(routes) {
	const chain = []
	for (const { path, exports } of routes) {
		const promise = new Promise(async resolve => {
			let head = ""
			if ("Head" in exports) {
				const Component = exports.Head
				head = ReactDOMServer.renderToStaticMarkup(
					<Component {...props[path]} />
				)
			}
			head = head
				.replace(/></g, ">\n\t\t<")
				.replace(/\/>/g, " />")

			let page = '<div id="root"></div>'
			if ("default" in exports) {
				const Component = exports.default
				page = ReactDOMServer.renderToString(
					<div id="root">
						<Component {...props[path]} />
					</div>
				)
			}

			page += '\n\t\t<script src="/app.js"></script>'
			resolve({ path, head, page })
		})
		chain.push(promise)
	}
	const resolvedAsArr = await Promise.all(chain)
	console.log(JSON.stringify(resolvedAsArr, null, 2))
}

asyncRun([
	` + strings.Join(exports(r.PageBasedRouter), ",\n\t") + `
])
`

	src := p.Join(r.DirConfiguration.CacheDirectory, "pages.esbuild.js")

	if err := ioutil.WriteFile(src, []byte(text), perm.File); err != nil {
		return errs.WriteFile(src, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{src},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX, ".ts": api.LoaderTSX},
	})
	// TODO
	if len(results.Warnings) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Warnings))
	} else if len(results.Errors) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	stdout, err := run.Cmd(results.OutputFiles[0].Contents, "node")
	if err != nil {
		return err
	}

	var pages []prerenderedPage
	if err := json.Unmarshal(stdout, &pages); err != nil {
		return errs.Unexpected(err)
	}

	for _, each := range pages {
		if dir := p.Dir(each.DstPath); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
		var buf bytes.Buffer
		if err := r.baseTemplate.Execute(&buf, each); err != nil {
			return errs.ExecuteTemplate(r.baseTemplate.Name(), err)
		}
		if err := ioutil.WriteFile(each.DstPath, buf.Bytes(), perm.File); err != nil {
			return errs.WriteFile(each.DstPath, err)
		}
	}
	return nil
}
