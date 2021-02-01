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
	"github.com/zaydek/retro/pkg/term"
)

// TODO: May want to add some kind of scroll-restoration logic for SSE as well
// as disconnected SSE to stop retrying. Can try retry -1 for example.
func (r Runtime) RenderPageBytes(route PageBasedRoute) ([]byte, error) {
	if _, err := os.Stat(p.Join(r.DirConfiguration.CacheDirectory, "props.js")); os.IsNotExist(err) {
		return nil, errors.New("It looks like your loaders have not been resolved yet. " +
			"Remove " + term.Bold("--cached") + " and try again.")
	}

	// TODO: When esbuild adds support for dynamic imports, this can be changed to
	// a pure JavaScript implementation.
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

` + fmt.Sprintf(`const %s = require("%s")`, route.Component, "../"+route.SrcPath) + `
` + fmt.Sprintf(`const props = require("%s").default, ../`+r.DirConfiguration.CacheDirectory+"/props.js") + `

function run({ path, exports }) {
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

	page += '\n'
	page += 'events.addEventListener("reload", e => {' + '\n'
	page += '	window.location.reload()' + '\n'
	page += '})' + '\n'
	page += 'events.addEventListener("error", e => {' + '\n'
	page += '	events.close()' + '\n'
	page += '	// prettier-ignore' + '\n'
	page += '	console.log(' + '\n'
	page += '		"retro: Disconnected from the dev server. " +' + '\n'
	page += '		"Try %cretro watch%c to reconnect.",' + '\n'
	page += '		"font-weight: bold",' + '\n'
	page += '		"none",' + '\n'
	page += '	)' + '\n'
	page += '})' + '\n'

	console.log(JSON.stringify({ ...etc, head, page }))
}

run([
	` + strings.Join(exports(r.PageBasedRouter), ",\n\t") + `
])
`

	src := p.Join(r.DirConfiguration.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component))

	if err := ioutil.WriteFile(src, []byte(text), perm.File); err != nil {
		return nil, errs.WriteFile(src, err)
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
		return nil, errors.New(formatEsbuildMessagesAsTermString(results.Warnings))
	} else if len(results.Errors) > 0 {
		return nil, errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	stdout, err := run.Cmd(results.OutputFiles[0].Contents, "node")
	if err != nil {
		return nil, errs.RunNode(err)
	}

	var page prerenderedPage
	if err := json.Unmarshal(stdout, &page); err != nil {
		return nil, errs.Unexpected(err)
	}

	var buf bytes.Buffer
	if err := r.IndexHTMLTemplate.Execute(&buf, page); err != nil {
		return nil, errs.ExecuteTemplate(r.IndexHTMLTemplate.Name(), err)
	}
	return buf.Bytes(), nil
}
