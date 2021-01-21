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
	"Meta": func() string {
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
	"App": func() string {
		str := `
			<script src="/app.js"></script>
		`
		str = strings.TrimSpace(str)
		str = re.ReplaceAllString(str, "\t\t")
		return str
	},
}

func prerenderPages(retro Retro) error {
	bstr, err := ioutil.ReadFile(path.Join(retro.Config.AssetDir, "index.html"))
	if err != nil {
		return fmt.Errorf("failed to read %s/index.html; %w", retro.Config.AssetDir, err)
	}

	html := string(bstr)
	if !strings.Contains(html, `{{ Meta }}`) {
		return errors.New(`no such {{ Meta }}; add to <head>`)
	} else if !strings.Contains(html, `<div id="root"></div>`) {
		return errors.New(`no such <div id="root"></div>; add to <body> before {{ App }}`)
	} else if !strings.Contains(html, `{{ App }}`) {
		return errors.New(`no such {{ App }}; add to <body> after <div id="root"></div>`)
	}

	tmpl, err := template.New(path.Join(retro.Config.AssetDir, "index.html")).Funcs(funcMap).Parse(html)
	if err != nil {
		return fmt.Errorf("failed to parse template %s/index.html; %w", retro.Config.AssetDir, err)
	}

	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, nil); err != nil {
		return fmt.Errorf("failed to execute template %s/index.html; %w", retro.Config.AssetDir, err)
	}

	if err := ioutil.WriteFile(path.Join(retro.Config.BuildDir, "index.html"), buf.Bytes(), 0644); err != nil {
		stderr.Fatalf("failed to write %s/index.html; %w\n", retro.Config.BuildDir, err)
	}
	return nil
}
