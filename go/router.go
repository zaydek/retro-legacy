package main

import (
	"fmt"
	"os"
	"path/filepath"
)

type PageBasedRoute struct {
	Path      string `json:"path"`      // E.g. a/b/c/page-name.tsx
	Page      string `json:"page"`      // E.g. /page-name
	Component string `json:"component"` // E.g. PageName
}

type PageBasedRouter []PageBasedRoute

var allowedRouteFileTypes = []string{
	".js",  // JavaScript
	".jsx", // React JavaScript
	".ts",  // TypeScript
	".tsx", // React TypeScript
	".md",  // Markdown
	".mdx", // MDX (React Markdown)
}

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
func newPageBasedRoute(path string) PageBasedRoute {
	// TODO: Sanitize `path`; should be limited to set of cross-platform ASCII
	// characters. In the future, this can be broadened to support Unicode
	// characters more generally.
	// TODO: For now, let’s lazily qualify the path name against a regex. Later,
	// we should qualify more carefully using `parseParts` or equivalent.
	route := PageBasedRoute{
		Path:      path,
		Page:      "/" + path[:len(path)-len(filepath.Ext(path))],
		Component: "TODO",
	}
	return route
}

func (c *Configuration) InitPageBasedRouter() (PageBasedRouter, error) {
	var router PageBasedRouter
	err := filepath.Walk(c.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// TODO: Extract `noOpFilesAndFolders`?
		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if isAllowedRouteFileType(path) {
			router = append(router, newPageBasedRoute(path))
		}
		return nil
	})
	if err != nil {
		return nil, fmt.Errorf("cannot get page-based router; %w", err)
	}
	return router, nil
}
