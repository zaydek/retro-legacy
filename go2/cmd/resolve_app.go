package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	"path"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
)

// // App
// {{if .Flags.HasApp -}}
// import App from "../{{.Config.PagesDir}}/internal/app"
// {{- else -}}
// // (No <App> component)
// {{- end}}

// // Page props
// {{if .Flags.HasPageProps -}}
// import pageProps from "../{{.Config.CacheDir}}/pageProps"
// {{- else -}}
// // (No pageProps.js)
// {{- end}}

// resolveApp synchronously resolves bytes for build/app.js.
func resolveApp(retro Retro) ([]byte, error) {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
` + buildRequireStatement(retro.Routes) + `

// Page props
const pageProps = require("../{{.Config.CacheDir}}/pageProps.js")

export default function RoutedApp() {
	return (
		<Router>
		{{ range $each := .Routes }}
			<Route path="{{ $each.Path }}">
				<{{ $each.Component }} {...pageProps["{{ $each.Path }}"]} />
			</Route>
		{{ end }}
		</Router>
	)
}

{{if not .Config.ReactStrictMode -}}
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
{{- end}}
`

	tmpl, err := template.New(path.Join(retro.Config.CacheDir, "app.js")).Parse(rawstr)
	if err != nil {
		return nil, fmt.Errorf("failed to parse template %s/app.js; %w", retro.Config.CacheDir, err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, retro); err != nil {
		return nil, fmt.Errorf("failed to execute template %s/app.js; %w", retro.Config.CacheDir, err)
	}

	if err := ioutil.WriteFile(path.Join(retro.Config.CacheDir, "app.esbuild.js"), buf.Bytes(), 0644); err != nil {
		return nil, fmt.Errorf("failed to write %s/app.js; %w", retro.Config.CacheDir, err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"production\""},
		EntryPoints: []string{path.Join(retro.Config.CacheDir, "app.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return nil, fmt.Errorf("failed to marshal; %w", err)
		}
		return nil, errors.New(string(bstr))
	}

	contents := results.OutputFiles[0].Contents
	return contents, nil
}
