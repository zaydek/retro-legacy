package embeds

import (
	_ "embed"
	"text/template"
)

type PackageDot struct {
	AppName      string
	RetroVersion string
}

//go:embed package.javascript.json
var javaScriptPackage string

//go:embed package.typescript.json
var typeScriptPackage string

var JavaScriptPackageTemplate = template.Must(template.New("package.json").Parse(javaScriptPackage))
var TypeScriptPackageTemplate = template.Must(template.New("package.json").Parse(typeScriptPackage))
