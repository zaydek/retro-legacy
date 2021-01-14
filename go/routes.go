package main

import (
	"fmt"
	"path/filepath"
	"strings"
)

type PageBasedRoute struct {
	pathStr       string // E.g. a/b/c/page-name.tsx
	pageName      string // E.g. /page-name
	componentName string // E.g. PageName
}

// Initializes a new page-based route. A page-based route provides a layer of
// indirection so that a path name can be queried as a page name or as a
// React-constructable component name.
func newPageBasedRoute(pathStr string) (*PageBasedRoute, error) {
	// TODO: Sanitize `pathStr`; should be limited to set of cross-platform ASCII
	// characters. In the future, this can be broadened to support Unicode
	// characters more generally.

	var ext = ""
	ext = filepath.Ext(pathStr)
	ext = strings.TrimLeft(ext, ".")
	if ext != "js" && ext != "jsx" && ext != "ts" && ext != "tsx" && ext != "md" && ext != "mdx" {
		return nil, fmt.Errorf("page-based routes must be of type js|jsx|ts|tsx|md|mdx; ext=%s", ext)
	}

	var pageName = ""
	pageName = filepath.Base(pathStr)
	pageName = pageName[:len(pageName)-len(filepath.Ext(pageName))]
	pageName = "/" + pageName

	route := &PageBasedRoute{
		pathStr:       pathStr,
		pageName:      pageName,
		componentName: "TODO",
	}
	return route, nil
}

// Read-only getter for the page name.
func (r *PageBasedRoute) PageName() string {
	return r.pageName
}

// Read-only getter for the component name.
func (r *PageBasedRoute) ComponentName() string {
	return r.componentName
}

func getPageBasedRoutes() {
}
