package main

type DirConfiguration struct {
	WwwDir      string // e.g. www
	SrcPagesDir string // e.g. src/pages
	CacheDir    string // e.g. __cache__
	ExportDir   string // e.g. __export__
}

type Route struct {
	Type          string // e.g. "static" or "dynamic"
	Source        string // e.g. src/pages/foo/bar.js
	ComponentName string // e.g. <ComponentName />
}

// type ResolvedRoute struct {
// 	Type          string // e.g. "static" or "dynamic"
// 	Source        string // e.g. src/pages/foo/bar.js
// 	Target        string // e.g. __export__/foo/bar.html
// 	Pathname      string // e.g. <Link path={Pathname} />
// 	ComponentName string // e.g. <ComponentSyntax />
// }

type Runtime struct {
	Cmd    interface{}
	Dirs   DirConfiguration
	Routes []Route
}
