package main

import (
	"fmt"
	"os"
	"path/filepath"
)

type PageBasedRoute struct {
	path          string // E.g. a/b/c/page-name.tsx
	pageName      string // E.g. /page-name
	componentName string // E.g. PageName
}

// Allowed file types.
var allowedFileTypes = []string{
	".js",  // JavaScript
	".jsx", // React JavaScript
	".ts",  // TypeScript
	".tsx", // React TypeScript
	".md",  // Markdown
	".mdx", // MDX (React Markdown)
}

// Returns whether a path matches one of the allowed file types.
func isAllowedFileType(path string) bool {
	ext := filepath.Ext(path)
	for _, fileType := range allowedFileTypes {
		if ext == fileType {
			return true
		}
	}
	return false
}

// Initializes a new page-based route. A page-based route provides a layer of
// indirection so that a path name can be queried as a page name or as a React-
// constructable component name.
func newPageBasedRoute(path string) *PageBasedRoute {
	// TODO: Sanitize `path`; should be limited to set of cross-platform ASCII
	// characters. In the future, this can be broadened to support Unicode
	// characters more generally.
	route := &PageBasedRoute{
		path:          path,
		pageName:      "/" + path[:len(path)-len(filepath.Ext(path))],
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

// Gets page-based routes from a configuration file.
//
// Based on https://golang.org/pkg/path/filepath/#Walk.
func (config *Configuration) GetPageBasedRoutes() ([]*PageBasedRoute, error) {
	routes := []*PageBasedRoute{}
	err := filepath.Walk(config.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// TODO: Right now we arbitrarily skip over `internal` folders.
		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if isAllowedFileType(path) {
			routes = append(routes, newPageBasedRoute(path))
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("cannot get page-based routes; %w", err)
	}
	return routes, nil
}
