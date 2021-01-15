package main

import (
	"bytes"
	"text/template"
)

// This service is responsible for resolving bytes for `cache/app.js`.
func ReadApp(config Configuration, router PageBasedRouter) ([]byte, error) {
	var buf bytes.Buffer

	dot := struct {
		Config Configuration   `json:"config"`
		Router PageBasedRouter `json:"router"`
	}{Config: config, Router: router}

	const data = `
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// FIXME: We need to check whether the user has a component here. As a temporary
// fix, we can os.Stat and check whether a file exists. We don’t need to check
// that the file does what it’s supposed to do for now.
{{if true -}}
// App
import App from "../{{.PagesDir}}/internal/app"
{{- else -}}
// (No <App> component)
{{- end}}

// Pages
{{range $x, $each := .Pages -}}
	{{if gt $x 0}}{{"\n"}}{{end}}import {{ $each.Component }} from "{{ $each.Page }}"
{{- end}}

// FIXME: We need to check whether the user has a component here. As a temporary
// fix, we can os.Stat and check whether a file exists. We don’t need to check
// that the file does what it’s supposed to do for now.
{{if true -}}
// Page props
// TODO: Add support for 'appProps'
import pageProps from "./pageProps"
{{- else -}}
// (No pageProps.json)
{{- end}}

export default function RoutedApp() {
	return (
		<Router>
		{{range .Pages}}
			<Route page="{{.Page}}">
				<{{.Component }} {...pageProps["{{.Page}}"]} />
			</Route>
		{{end}}
		</Router>
	)
}

{{if not .ReactStrictMode -}}
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
	tmpl := template.Must(template.New("").Parse(data))
	err := tmpl.Execute(&buf, dot)
	if err != nil {
		return nil, err
	}
	contents := bytes.TrimLeft(buf.Bytes(), "\n") // Remove BOF
	return contents, nil
}
