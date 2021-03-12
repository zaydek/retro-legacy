package main

type DirConfiguration struct {
	WwwDir      string // e.g. www
	SrcPagesDir string // e.g. src/pages
	CacheDir    string // e.g. __cache__
	ExportDir   string // e.g. __export__
}

type Route struct {
	Type            string `json:"type"`      // e.g. "static" or "dynamic"
	Source          string `json:"source"`    // e.g. src/pages/foo/bar.js
	ComponentSyntax string `json:"component"` // e.g. <ComponentSyntax />
}

// type ResolvedRoute struct {
// 	Type            string `json:"type"`      // e.g. "static" or "dynamic"
// 	Source          string `json:"source"`    // e.g. src/pages/foo/bar.js
// 	Destination     string `json:"dest"`      // e.g. __export__/foo/bar.html
// 	PathSyntax      string `json:"path"`      // e.g. <Link path={PathSyntax} />
// 	ComponentSyntax string `json:"component"` // e.g. <ComponentSyntax />
// }

type Runtime struct {
	Cmd    interface{}
	Dirs   DirConfiguration
	Routes []Route
}
