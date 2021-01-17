package main

import (
	"bytes"
	"encoding/json"
	"errors"
	"text/template"
)

// PagesResponse describes the response data structure for the pages service.
type PagesResponse []struct {
	Page string `json:"Page"`

	Document string `json:"document"` // TODO: Not yet implemented
	Head     string `json:"head"`
	Root     string `json:"root"`
}

// ReadRenderedPages is responsible for resolving bytes for `build/page.html`.
func ReadRenderedPages(config Configuration, router PageBasedRouter) ([]RenderedPage, error) {
	dot := struct {
		Config Configuration   `json:"config"`
		Router PageBasedRouter `json:"router"`
	}{Config: config, Router: router}

	dotBytes, err := json.MarshalIndent(dot, "", "\t")
	if err != nil {
		return nil, err
	}

	stdout, stderr, err := execcmd("yarn", "-s", "ts-node", "-T", "go/services/pages.tsx", string(dotBytes))
	if stderr != nil { // Takes precedence
		return nil, errors.New(string(stderr))
	} else if err != nil {
		return nil, err
	}

	var response PagesResponse
	err = json.Unmarshal(stdout, &response)
	if err != nil {
		return nil, err
	}

	var renderedPages []RenderedPage
	for _, each := range response {
		var buf bytes.Buffer

		const tmplStr = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		{{- if .Head -}}
			{{- print "\n\t\t" .Head "\n\t" -}}
		{{- else -}}
			{{- print "\n\t\t" "<title>Hello, world!</title>" "\n\t" -}}
		{{- end -}}
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">{{if .Root}}{{.Root}}{{end}}</div>
		<script src="/app.js"></script>
	</body>
</html>
`
		// TODO: Parse template eagerly.
		tmpl := template.Must(template.New("prerender-page").Parse(tmplStr))
		err := tmpl.Execute(&buf, each)
		if err != nil {
			return nil, err
		}
		data := bytes.TrimLeft(buf.Bytes(), "\n") // Remove BOF
		renderedPages = append(renderedPages, RenderedPage{Page: each.Page, Data: data})
	}

	return renderedPages, nil
}
