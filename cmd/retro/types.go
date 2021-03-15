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

type Runtime struct {
	Cmd      interface{}
	Dirs     DirConfiguration
	Template string
	Routes   []Route
}

////////////////////////////////////////////////////////////////////////////////

// export type Props = { [key: string]: unknown }
type Props = map[string]interface{}

// export type ServerProps = Props & { path: string }
type ServerProps struct {
	Props        // Embed
	Path  string `json:"path"`
}

// export interface ServerRoute {
//   Route: Route & { Target: string; Pathname: string }
//   Props: ServerProps
// }
type ServerRoute struct {
	Route struct {
		Route    // Embed
		Target   string
		Pathname string
	}
	Props ServerProps
}

// export interface ServerRouter {
//   [key: string]: ServerRoute
// }
type ServerRouter map[string]ServerRoute
