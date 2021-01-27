package main

import (
	"errors"
	"io/ioutil"
	p "path"
	"strings"
	"text/template"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/errs"
)

type prerenderedPage struct {
	FSPath string `json:"fs_path"`
	Path   string `json:"path"`
	Head   string `json:"head"`
	Page   string `json:"page"`
}

// parseRootHTMLTemplate parses public/index.html as a text/template template.
func parseRootHTMLTemplate(config DirConfiguration) (*template.Template, error) {
	bstr, err := ioutil.ReadFile(p.Join(config.AssetDirectory, "index.html"))
	if err != nil {
		return nil, errs.ReadFile(p.Join(config.AssetDirectory, "index.html"), err)
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return nil, errors.New("No such template tag " + color.Bold("{{ .Head }}") + ". " +
			"This is the entry point for the " + color.Bold("<Head>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Head }}") + " to " + color.Bold("<head>") + ".")
	} else if !strings.Contains(text, "{{ .Page }}") {
		return nil, errors.New("No such template tag " + color.Bold("{{ .Page }}") + ". " +
			"This is the entry point for the " + color.Bold("<Page>") + " component in your page components. " +
			"Add " + color.Bold("{{ .Page }}") + " to " + color.Bold("<body>") + ".")
	}

	tmpl, err := template.New(p.Join(config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return nil, errs.ParseTemplate(p.Join(config.AssetDirectory, "index.html"), err)
	}
	return tmpl, nil
}
