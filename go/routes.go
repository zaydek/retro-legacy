package main

import "path/filepath"

type PageBasedRoute struct {
	pathStr       string // a/b/c/page-name.tsx
	pageName      string // /page-name
	componentName string // PageName
}

func newPageBasedRoute(pathStr string) *PageBasedRoute {
	// TODO: Sanitize `pathstr`; should be limited to set of cross-platform ASCII
	// characters. In the future, this can be broadened to support Unicode
	// characters more generally.

	var pageName = ""
	pageName = filepath.Base(pathStr)
	pageName = pageName[:len(pageName)-len(filepath.Ext(pageName))]
	pageName = "/" + pageName

	route := &PageBasedRoute{
		pathStr:       pathStr,
		pageName:      pageName,
		componentName: "TODO",
	}
	return route
}

// Read-only getter for the page name.
func (r *PageBasedRoute) PageName() string {
	return r.pageName
}

// Read-only getter for the component name.
func (r *PageBasedRoute) ComponentName() string {
	return r.componentName
}

// // TODO
// func getPageBasedRoutes() {
// }
