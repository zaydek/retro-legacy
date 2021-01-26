package embedded

import "text/template"

// PkgStruct describes the struct used to execute PkgTemplate.
type PkgStruct struct {
	RepoName            string
	ReactVersion        string
	ReactDOMVersion     string
	RetroVersion        string
	RetroScriptsVersion string
}

//go:embed pkg.json
var pkg string

var PkgTemplate = template.Must(template.New("package.json").Parse(pkg))
