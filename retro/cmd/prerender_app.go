package main

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	p "path"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cmd/errs"
	"github.com/zaydek/retro/perm"
)

func (r Runtime) prerenderApp() error {
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
` + buildRequireStmt(r.Router) + `

// Props
const props = require("../{{ .Config.CacheDirectory }}/props.js").default

export default function RoutedApp() {
	return (
		<Router>
		{{ range $each := .Router }}
			<Route path="{{ $each.Path }}">
				<{{ $each.Component }} {...props["{{ $each.Path }}"]} />
			</Route>
		{{ end }}
		</Router>
	)
}

ReactDOM.hydrate(
	<RoutedApp />,
	document.getElementById("root"),
)
`

	var buf bytes.Buffer
	tmpl, err := template.New(p.Join(r.Config.CacheDirectory, "app.esbuild.js")).Parse(text)
	if err != nil {
		return errs.ParseTemplate(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), err)
	} else if err := tmpl.Execute(&buf, r); err != nil {
		return errs.ExecuteTemplate(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), err)
	}

	if err := ioutil.WriteFile(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), buf.Bytes(), perm.File); err != nil {
		return errs.WriteFile(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", os.Getenv("NODE_ENV") == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", os.Getenv("NODE_ENV")),
		},
		EntryPoints: []string{p.Join(r.Config.CacheDirectory, "app.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	path := p.Join(r.Config.BuildDirectory, fmt.Sprintf("app.%s.js", r.epochUUID))
	if err := ioutil.WriteFile(path, results.OutputFiles[0].Contents, perm.File); err != nil {
		return errs.WriteFile(path, err)
	}
	return nil
}
