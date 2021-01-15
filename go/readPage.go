package main

import (
	"bytes"
	"text/template"
)

// This service is responsible for resolving bytes for `build/page.html`.
func ReadPage(config Configuration, page PageBasedRoute) ([]byte, error) {
	var buf bytes.Buffer

	dot := struct {
		Config Configuration   `json:"config"`
		Router PageBasedRouter `json:"router"`
	}{Config: config, Router: router}

	const data = `
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
		<meta name="viewport" content="width=device-width, initial-scale=1">
		{{if .Head}}{{.Head}}{{end}}
	</head>
	<body>
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">{{if .Root}}{{.Root}}{{end}}</div>
		<script src="/app.js"></script>
	</body>
</html>
`
	tmpl := template.Must(template.New("").Parse(data))
	err := tmpl.Execute(&buf, dot)
	if err != nil {
		return nil, err
	}
	contents := bytes.TrimLeft(buf.Bytes(), "\n") // Remove BOF
	return contents, nil
}
