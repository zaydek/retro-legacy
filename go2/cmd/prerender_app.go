package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	pathpkg "path"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/errs"
)

// // App
// {{if .Flags.HasApp -}}
// import App from "../{{.Configuration.PagesDir}}/internal/app"
// {{- else -}}
// // (No <App> component)
// {{- end}}

func prerenderApp(app *RetroApp) error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
` + buildRequireStmt(app.PageBasedRouter) + `

// Props
const props = require("../{{ .Configuration.CacheDirectory }}/props.js").default

export default function RoutedApp() {
	return (
		<Router>
		{{ range $each := .PageBasedRouter }}
			<Route pathpkg="{{ $each.Path }}">
				<{{ $each.Component }} {...props["{{ $each.Path }}"]} />
			</Route>
		{{ end }}
		</Router>
	)
}

{{ if not .Configuration.ReactStrictMode -}}
ReactDOM.hydrate(
	<RoutedApp />,
	document.getElementById("root"),
)
{{- else -}}
ReactDOM.hydrate(
	<React.StrictMode>
		<RoutedApp />
	</React.StrictMode>,
	document.getElementById("root"),
)
{{- end }}
`

	var buf bytes.Buffer
	tmpl, err := template.New(pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js")).Parse(rawstr)
	if err != nil {
		return errs.ParseTemplate(pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js"), err)
	} else if err := tmpl.Execute(&buf, app); err != nil {
		return errs.ExecuteTemplate(pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js"), err)
	}

	if err := ioutil.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js"), buf.Bytes(), 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle: true,
		Define: map[string]string{
			"__DEV__":              fmt.Sprintf("%t", app.Configuration.Env == "development"),
			"process.env.NODE_ENV": fmt.Sprintf("%q", app.Configuration.Env),
		},
		EntryPoints: []string{pathpkg.Join(app.Configuration.CacheDirectory, "app.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return errs.Unexpected(err)
		}
		return errors.New(string(bstr))
	}

	if err := ioutil.WriteFile(pathpkg.Join(app.Configuration.BuildDirectory, "app.js"), results.OutputFiles[0].Contents, 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(app.Configuration.BuildDirectory, "app.js"), err)
	}
	return nil
}
