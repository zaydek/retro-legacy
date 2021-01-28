package embedded

import (
	_ "embed"

	"text/template"
)

type PackageDot struct {
	RepoName           string
	ReactVersion       string
	ReactDOMVersion    string
	RetroClientVersion string
	RetroServerVersion string
}

//go:embed package.json
var package_ string

var PackageTemplate = template.Must(template.New("package.json").Parse(package_))
