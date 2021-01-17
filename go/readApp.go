package main

import (
	"bytes"
	"os"
	"text/template"
)

// ReadApp is responsible for resolving bytes for `cache/app.js`.
func ReadApp(config Configuration, router PageBasedRouter) ([]byte, error) {
	var buf bytes.Buffer

	f1, err := os.Stat(config.PagesDir + "/internal/app.tsx")
	if err != nil {
		return nil, err
	}
	hasApp := f1 != nil

	f2, err := os.Stat(config.CacheDir + "/pageProps.js")
	if err != nil {
		return nil, err
	}
	hasPageProps := f2 != nil

	type Flags struct {
		HasApp       bool
		HasPageProps bool
	}
	dot := struct {
		Flags  Flags
		Config Configuration
		Router PageBasedRouter
	}{
		Flags: Flags{
			HasApp:       hasApp,
			HasPageProps: hasPageProps,
		},
		Config: config, Router: router,
	}

	const data = `
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// App
{{if .Flags.HasApp -}}
import App from "../{{.Config.PagesDir}}/internal/app"
{{- else -}}
// (No <App> component)
{{- end}}

// Pages
{{range $x, $each := .Router -}}
	{{if gt $x 0}}{{"\n"}}{{end}}import {{ $each.Component }} from "{{ $each.Page }}"
{{- end}}

// Page props
{{if .Flags.HasPageProps -}}
import pageProps from "../{{.Config.CacheDir}}/pageProps"
{{- else -}}
// (No pageProps.js)
{{- end}}

export default function RoutedApp() {
	return (
		<Router>
		{{range .Router}}
			<Route page="/{{.Page}}">
				<{{.Component }} {...pageProps["{{.Page}}"]} />
			</Route>
		{{end}}
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
	tmpl := template.Must(template.New("prerender-app").Parse(data))
	err := tmpl.Execute(&buf, dot)
	if err != nil {
		return nil, err
	}
	contents := bytes.TrimLeft(buf.Bytes(), "\n") // Remove BOF
	return contents, nil
}
