package embeds

import (
	"embed"
	"io/fs"
	"text/template"
)

type PkgDot struct {
	AppName         string
	SvetlanaVersion string
}

//go:embed javascript/*
var jsFS embed.FS

var JSFS, _ = fs.Sub(jsFS, "javascript")

//go:embed package.json
var jsPkg string

var JSPkgTemplate = template.Must(template.New("package.json").Parse(jsPkg))
