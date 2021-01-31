package dev

import (
	"errors"
	"fmt"
	"io/ioutil"
	p "path"
	"strings"
	"text/template"

	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/term"
)

func requires(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`const %s = require("%s")`,
			each.Component, "../"+each.SrcPath))
	}
	return arr
}

func exports(routes []PageBasedRoute) []string {
	var arr []string
	for _, each := range routes {
		arr = append(arr, fmt.Sprintf(`{ srcPath: %q, dstPath: %q, path: %q, exports: %s }`,
			each.SrcPath, each.DstPath, each.Path, each.Component))
	}
	return arr
}

// parseBaseHTMLTemplate parses public/index.html as a text/template template.
func (r Runtime) parseBaseHTMLTemplate() (*template.Template, error) {
	bstr, err := ioutil.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"))
	if err != nil {
		return nil, errs.ReadFile(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}

	text := string(bstr)
	if !strings.Contains(text, "{{ .Head }}") {
		return nil, errors.New("No such template tag " + term.Bold("{{ .Head }}") + ". " +
			"This is the entry point for the " + term.Bold("<Head>") + " component in your page components. " +
			"Add " + term.Bold("{{ .Head }}") + " to " + term.Bold("<head>") + ".")
	} else if !strings.Contains(text, "{{ .Page }}") {
		return nil, errors.New("No such template tag " + term.Bold("{{ .Page }}") + ". " +
			"This is the entry point for the " + term.Bold("<Page>") + " component in your page components. " +
			"Add " + term.Bold("{{ .Page }}") + " to " + term.Bold("<body>") + ".")
	}

	base, err := template.New(p.Join(r.Config.AssetDirectory, "index.html")).Parse(text)
	if err != nil {
		return nil, errs.ParseTemplate(p.Join(r.Config.AssetDirectory, "index.html"), err)
	}
	return base, nil
}
