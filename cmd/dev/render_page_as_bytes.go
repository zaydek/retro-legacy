package dev

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/run"
	"github.com/zaydek/retro/pkg/term"
)

// const pageProps = require("../{{ .DirConfiguration.CacheDirectory }}/pageProps.js").default
func (r Runtime) RenderPageAsBytes(route PageBasedRoute) ([]byte, error) {
	src := p.Join(r.DirConfiguration.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component))

	if _, err := os.Stat(p.Join(r.DirConfiguration.CacheDirectory, "pageProps.js")); os.IsNotExist(err) {
		return nil, errors.New("It looks like your loaders have not been resolved yet. " +
			"Remove " + term.Bold("--cached") + " and try again.")
	}

	// TODO: When esbuild adds support for dynamic imports, this can be changed to
	// a pure JavaScript implementation.
	text := `// THIS FILE IS AUTOGENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

// Pages
` + fmt.Sprintf(`const %s = require("../%s")`, route.Component, route.SrcPath) + `

// Page props
const pageProps = require("./pageProps.js").default

function run({ path, exports, ...etc }) {
	let head = ""
	if ("Head" in exports) {
		const Component = exports.Head
		head = ReactDOMServer.renderToStaticMarkup(
			<Component {...pageProps[path]} />
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
				<Component {...pageProps[path]} />
			</div>
		)
	}
	page += '\n\t\t<script>const events = new EventSource("/events"); events.addEventListener("reload", e => window.location.reload()); events.addEventListener("error", e => events.close())</script>'

	console.log(JSON.stringify({ ...etc, head, page }))
}

run(` + export(route) + `)
`

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
		return nil, errs.PipeEsbuildToNode(err)
	}

	var page rendererdPage
	if err := json.Unmarshal(stdout, &page); err != nil {
		return nil, errs.Unexpected(err)
	}

	var buf bytes.Buffer
	if err := r.baseTemplate.Execute(&buf, page); err != nil {
		return nil, errs.ExecuteTemplate(r.baseTemplate.Name(), err)
	}
	return buf.Bytes(), nil
}
