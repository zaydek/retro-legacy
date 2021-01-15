package main

import (
	"bytes"
	"text/template"
)

type MyPageBasedRoute struct {
	Path      string
	Page      string
	Component string
}

// TODO: Embed configuration?
// TODO: Maybe we put `PageBasedRouter` as a member of `Configuration` or do the
// opposite.
type MyPageBasedRouter struct {
	EnableReactStrictMode bool
	PageProps             bool
	HasApp                bool
	Pages                 []MyPageBasedRoute
}

// This service is responsible for resolving bytes for `cache/app.js`.
func AppService(routes []*PageBasedRoute) ([]byte, error) {
	var out bytes.Buffer

	myRoutes := MyPageBasedRouter{
		EnableReactStrictMode: true,
		PageProps:             true,
		HasApp:                true,
		Pages: []MyPageBasedRoute{
			{
				Path:      "pages/page-a.tsx",
				Page:      "/page-a", // TODO: Change to `page` not `pageName`
				Component: "PageA",   // TODO: Change to `component`
			},
			{
				Path:      "pages/page-b.tsx",
				Page:      "/page-b", // TODO: Change to `page` not `pageName`
				Component: "PageB",   // TODO: Change to `component`
			},
			{
				Path:      "pages/page-c.tsx",
				Page:      "/page-c", // TODO: Change to `page` not `pageName`
				Component: "PageC",   // TODO: Change to `component`
			},
		},
	}
	const data = `
// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

{{if .HasApp -}}
// App
import App from "../pages/internal/app"
{{- else -}}
// (No <App> component)
{{- end}}

// Pages
{{range $x, $each := .Pages -}}
	{{if gt $x 0}}{{"\n"}}{{end}}import {{ $each.Component }} from "{{ $each.Page }}"
{{- end}}

{{if .PageProps -}}
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

{{if not .EnableReactStrictMode -}}
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
	t := template.Must(template.New("").Parse(data))
	err := t.Execute(&out, myRoutes)
	if err != nil {
		return nil, err
	}
	return out.Bytes(), nil
}
