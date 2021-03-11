package main

type CommandKind uint8

const (
	CommandDev CommandKind = iota
	CommandExport
	CommandServe
)

// RoutePartial describes an unresolved route; before serverProps or serverPaths.
type RoutePartial struct {
	Type            string `json:"type"`      // e.g. "static" or "dynamic"
	Source          string `json:"source"`    // e.g. src/pages/foo/bar.js
	ComponentSyntax string `json:"component"` // e.g. <ComponentSyntax />
}

// Route describes a resolved route; after serverProps or serverPaths.
type Route struct {
	Type            string `json:"type"`      // e.g. "static" or "dynamic"
	Source          string `json:"source"`    // e.g. src/pages/foo/bar.js
	Destination     string `json:"dest"`      // e.g. __export__/foo/bar.html
	PathSyntax      string `json:"path"`      // e.g. <Link path={PathSyntax} />
	ComponentSyntax string `json:"component"` // e.g. <ComponentSyntax />
}

// ComponentProps describes component props.
type ComponentProps struct {
	Path  string                 `json:"path"`
	Props map[string]interface{} `json:"props"`
}

// RouteMeta describes route metadata.
type RouteMeta struct {
	Route Route
	Props ComponentProps
}

// DirConfiguration describes directory configuration.
type DirConfiguration struct {
	WwwDir      string // e.g. www
	SrcPagesDir string // e.g. src/pages
	CacheDir    string // e.g. __cache__
	ExportDir   string // e.g. __export__
}

type Runtime struct {
	Command       interface{} // References cli package
	Dirs          DirConfiguration
	RoutePartials []RoutePartial
	Routes        []Route
}
