package main

import (
	"fmt"
	"os"
	"path/filepath"
)

type PageBasedRoute struct {
	Path          string `json:"path"`          // E.g. a/b/c/page-name.tsx
	PageName      string `json:"pageName"`      // E.g. /page-name
	ComponentName string `json:"componentName"` // E.g. PageName
}

// Allowed route file types.
var allowedRouteFileTypes = []string{
	".js",  // JavaScript
	".jsx", // React JavaScript
	".ts",  // TypeScript
	".tsx", // React TypeScript
	".md",  // Markdown
	".mdx", // MDX (React Markdown)
}

// Returns whether a path matches one of the allowed route file types.
func isAllowedRouteFileType(path string) bool {
	ext := filepath.Ext(path)
	for _, fileType := range allowedRouteFileTypes {
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
		Path:          path,
		PageName:      "/" + path[:len(path)-len(filepath.Ext(path))],
		ComponentName: "TODO",
	}
	return route
}

// Based on https://golang.org/pkg/path/filepath/#Walk.
func (c *Configuration) GetPageBasedRoutes() ([]*PageBasedRoute, error) {
	routes := []*PageBasedRoute{}
	err := filepath.Walk(c.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// TODO: Right now we arbitrarily skip over `internal` folders.
		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if isAllowedRouteFileType(path) {
			routes = append(routes, newPageBasedRoute(path))
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("cannot get page-based routes; %w", err)
	}
	return routes, nil
}
