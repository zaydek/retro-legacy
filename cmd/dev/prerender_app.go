package dev

import (
	"bytes"
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
)

func (r Runtime) prerenderApp() error {
	text := `// THIS FILE IS AUTO-GENERATED. DO NOT EDIT.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// Pages
` + strings.Join(requires(r.Router), "\n") + `

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

	src := p.Join(r.Config.CacheDirectory, "app.esbuild.js")
	dst := p.Join(r.Config.BuildDirectory, fmt.Sprintf("app.%s.js", r.epochUUID))

	var buf bytes.Buffer
	tmpl, err := template.New(src).Parse(text)
	if err != nil {
		return errs.ParseTemplate(src, err)
	} else if err := tmpl.Execute(&buf, r); err != nil {
		return errs.ExecuteTemplate(tmpl.Name(), err)
	}

	if err := ioutil.WriteFile(src, buf.Bytes(), perm.File); err != nil {
		return errs.WriteFile(src, err)
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
		return errors.New(formatEsbuildMessagesAsTermString(results.Warnings))
	} else if len(results.Errors) > 0 {
		return errors.New(formatEsbuildMessagesAsTermString(results.Errors))
	}

	if err := ioutil.WriteFile(dst, results.OutputFiles[0].Contents, perm.File); err != nil {
		return errs.WriteFile(dst, err)
	}
	return nil
}
