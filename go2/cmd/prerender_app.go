package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"io/ioutil"
	pathpkg "path"
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/errs"
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

func prerenderApp(retro Retro) error {
	rawstr := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
` + buildRequireStmt(retro.Routes) + `

// Props
const props = require("../{{ .Config.CacheDir }}/props.js").default

export default function RoutedApp() {
	return (
		<Router>
		{{ range $each := .Routes }}
			<Route pathpkg="{{ $each.Path }}">
				<{{ $each.Component }} {...props["{{ $each.Path }}"]} />
			</Route>
		{{ end }}
		</Router>
	)
}

{{ if not .Config.ReactStrictMode -}}
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
	tmpl, err := template.New(pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js")).Parse(rawstr)
	if err != nil {
		return errs.ParseTemplate(pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js"), err)
	} else if err := tmpl.Execute(&buf, retro); err != nil {
		return errs.ExecuteTemplate(pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js"), err)
	}

	if err := ioutil.WriteFile(pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js"), buf.Bytes(), 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js"), err)
	}

	results := api.Build(api.BuildOptions{
		Bundle:      true,
		Define:      map[string]string{"process.env.NODE_ENV": "\"development\""},
		EntryPoints: []string{pathpkg.Join(retro.Config.CacheDir, "app.esbuild.js")},
		Loader:      map[string]api.Loader{".js": api.LoaderJSX},
	})
	if len(results.Errors) > 0 {
		bstr, err := json.MarshalIndent(results.Errors, "", "\t")
		if err != nil {
			return errs.Unexpected(err)
		}
		return errors.New(string(bstr))
	}

	if err := ioutil.WriteFile(pathpkg.Join(retro.Config.BuildDir, "app.js"), results.OutputFiles[0].Contents, 0644); err != nil {
		return errs.WriteFile(pathpkg.Join(retro.Config.BuildDir, "app.js"), err)
	}
	return nil
}
