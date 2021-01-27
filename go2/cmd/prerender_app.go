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
	"github.com/zaydek/retro/errs"
)

func (r Runtime) prerenderApp() error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

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
	tmpl, err := template.New(p.Join(r.Config.CacheDirectory, "app.esbuild.js")).Parse(rawstr)
	if err != nil {
		return errs.ParseTemplate(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), err)
	} else if err := tmpl.Execute(&buf, r); err != nil {
		return errs.ExecuteTemplate(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), err)
	}

	if err := ioutil.WriteFile(p.Join(r.Config.CacheDirectory, "app.esbuild.js"), buf.Bytes(), 0644); err != nil {
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
		return errors.New(FormatMessageAsTermString(results.Errors))
	}

	if err := ioutil.WriteFile(p.Join(r.Config.BuildDirectory, "app.js"), results.OutputFiles[0].Contents, 0644); err != nil {
		return errs.WriteFile(p.Join(r.Config.BuildDirectory, "app.js"), err)
	}
	return nil
}
