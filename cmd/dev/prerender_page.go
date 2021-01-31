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
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/perm"
	"github.com/zaydek/retro/pkg/term"
)

// TODO: Can we embed PageBasedRoute here and simply add Head and Page?
type prerenderedPage struct {
	// TODO
	FSPath string `json:"srcPath"`

	srcPath     string `json:"srcPath"`
	DiskPathDst string `json:"diskPathDst"`
	Path        string `json:"path"`
	Head        string `json:"head"`
	Page        string `json:"page"`
}

// TODO: May want to add some kind of scroll-restoration logic for SSE as well
// as disconnected SSE to stop retrying. Can try retry -1 for example.
func (r Runtime) prerenderPageAsBytes(base *template.Template, route PageBasedRoute) ([]byte, error) {
	if _, err := os.Stat(p.Join(r.Config.CacheDirectory, "props.js")); os.IsNotExist(err) {
		return nil, errors.New("It looks like your loaders have not been resolved yet. " +
			"Remove " + term.Bold("--cached") + " and try again.")
	}

	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOMServer from "react-dom/server"

` + fmt.Sprintf(`const %s = require("../%s")`, route.Component, route.SrcPath) + `
const props = require("../` + r.Config.CacheDirectory + `/props.js").default

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
	page += '		<script src="/app.js"></script>\n'
	page += '		<script>\n'
	page += '			const __retro_sse__ = new EventSource("/sse")\n'
	page += '			__retro_sse__.addEventListener("reload", e => window.location.reload())\n'
	page += '			__retro_sse__.addEventListener("warning", e => console.warn(JSON.parse(e.data)))\n'
	page += '		</script>'

	console.log(JSON.stringify({ ...etc, head, page }))
}

run([
	` + strings.Join(exports(r.Router), ",\n\t") + `
])
`

	src := p.Join(r.Config.CacheDirectory, fmt.Sprintf("%s.esbuild.js", route.Component))

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

	var buf bytes.Buffer

	// TODO: It would also be nice if we can automatically unmarshal the return nil, of
	// Node since we’re only using Node for IPC processes.
	var page prerenderedPage
	stdoutBuf, err := runNode(results.OutputFiles[0].Contents)
	if err != nil {
		return nil, err
	} else if err := json.Unmarshal(stdoutBuf.Bytes(), &page); err != nil {
		return nil, errs.Unexpected(err)
	}

	if err := base.Execute(&buf, page); err != nil {
		return nil, errs.ExecuteTemplate(base.Name(), err)
	}

	return buf.Bytes(), nil
}
