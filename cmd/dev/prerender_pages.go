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
)

func (r Runtime) prerenderPages() error {
	base, err := r.parseBaseHTMLTemplate()
	if err != nil {
		return err
	}

	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + strings.Join(requires(r.Router), "\n") + `

// Props
` + fmt.Sprintf(`const props = require("%s").default, ../`+r.Config.CacheDirectory+"/props.js") + `

async function asyncRun(exports) {
	const chain = []
	for (const { path, exports } of exports) {
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
	` + strings.Join(exports(r.Router), ",\n\t") + `
])
`

	src := p.Join(r.Config.CacheDirectory, "pages.esbuild.js")

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

	stdoutBuf, err := runNode(results.OutputFiles[0].Contents)
	if err != nil {
		return err
	}

	var pages []prerenderedPage
	if err := json.Unmarshal(stdoutBuf.Bytes(), &pages); err != nil {
		return errs.Unexpected(err)
	}

	for _, each := range pages {
		if dir := p.Dir(each.DstPath); dir != "." {
			if err := os.MkdirAll(dir, perm.Directory); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
		var buf bytes.Buffer
		if err := base.Execute(&buf, each); err != nil {
			return errs.ExecuteTemplate(base.Name(), err)
		}
		if err := ioutil.WriteFile(each.DstPath, buf.Bytes(), perm.File); err != nil {
			return errs.WriteFile(each.DstPath, err)
		}
	}
	return nil
}
