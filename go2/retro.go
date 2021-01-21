package main

import (
	"bytes"
	"fmt"
	"io/ioutil"
	"regexp"
	"strings"
	"text/template"
)

var tabRe = regexp.MustCompile(`(?m)^\s+`)

var funcMap = template.FuncMap{
	"RetroMeta": func() string {
		str := `
			<title>Hello, world!</title>
			<meta name="title" content="Hello, world!" />
			<meta name="description" content="Hello, world!" />
			<link rel="stylesheet" href="app.css" />
		`
		str = strings.TrimSpace(str)
		str = tabRe.ReplaceAllString(str, "\t\t")
		return str
	},
	"RetroApp": func() string {
		str := `
			<script src="app.js"></script>
		`
		str = strings.TrimSpace(str)
		str = tabRe.ReplaceAllString(str, "\t\t")
		return str
	},
}

func main() {
	bstr, err := ioutil.ReadFile("index.html")
	if err != nil {
		panic(err)
	}
	tmpl, err := template.New("index.html").Funcs(funcMap).Parse(string(bstr))
	if err != nil {
		panic(err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, nil); err != nil {
		panic(err)
	}
	fmt.Print(buf.String())
}
