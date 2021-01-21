package main

import (
	"bytes"
	"errors"
	"fmt"
	"io/ioutil"
	"path"
	"regexp"
	"strings"
	"text/template"
)

var re = regexp.MustCompile(`(?m)^\s+`)

var funcMap = template.FuncMap{
	"RetroMeta": func() string {
		str := `
			<title>Hello, world!</title>
			<meta name="title" content="Hello, world!" />
			<meta name="description" content="Hello, world!" />
			<link rel="stylesheet" href="/app.css" />
		`
		str = strings.TrimSpace(str)
		str = re.ReplaceAllString(str, "\t\t")
		return str
	},
	// TODO: Add support for live reload here.
	"RetroApp": func() string {
		str := `
			<script src="/app.js"></script>
		`
		str = strings.TrimSpace(str)
		str = re.ReplaceAllString(str, "\t\t")
		return str
	},
}

// resolveIndexHTML synchronously resolves bytes for build/index.html.
func resolveIndexHTML(retro Retro) ([]byte, error) {
	bstr, err := ioutil.ReadFile(path.Join(retro.Config.AssetDir, "index.html"))
	if err != nil {
		return nil, fmt.Errorf("failed to read %s/public.html; %w", retro.Config.AssetDir, err)
	}
	html := string(bstr)
	if !strings.Contains(html, `{{ RetroMeta }}`) {
		return nil, errors.New(`no such {{ RetroMeta }}; add to <head>`)
	} else if !strings.Contains(html, `<div id="root"></div>`) {
		return nil, errors.New(`no such <div id="root"></div>; add to <body> before {{ RetroApp }}`)
	} else if !strings.Contains(html, `{{ RetroApp }}`) {
		return nil, errors.New(`no such {{ RetroApp }}; add to <body> after <div id="root"></div>`)
	}
	tmpl, err := template.New("index.html").Funcs(funcMap).Parse(html)
	if err != nil {
		return nil, fmt.Errorf("failed to parse %s/public.html; %w", retro.Config.AssetDir, err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, nil); err != nil {
		return nil, fmt.Errorf("failed to parse %s/public.html; %w", retro.Config.AssetDir, err)
	}
	contents := buf.Bytes()
	return contents, nil
}
