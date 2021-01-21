package main

import (
	"bytes"
	"fmt"
	"text/template"
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
	// requires, imports := resolveRequireAndImportStrings(retro)

	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
{{ range $x, $each := .Router -}}
	{{- if gt $x 0 -}}
		{{- "\n" -}}
	{{- end -}}
import {{ $each.Component }} from "{{ $each.Page }}"
{{- end }}

// Page props
import pageProps from "../{{.Config.CacheDir}}/pageProps"

export default function RoutedApp() {
	return (
		<Router>
		{{ range $each := .Routes }}
			<Route page="/{{ $each.Page }}">
				<{{ $each.Component }} {...pageProps["{{ $each.Page }}"]} />
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
	tmpl, err := template.New("app.js").Parse(rawstr)
	if err != nil {
		return nil, fmt.Errorf("TODO: %w", err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, retro); err != nil {
		return nil, fmt.Errorf("TODO: %w", err)
	}
	contents := buf.Bytes()
	return contents, nil
}
