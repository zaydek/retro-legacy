package main

import (
	"fmt"
	"os"
	"path/filepath"
)

type PageBasedRoute struct {
	Path      string `json:"path"`      // path/to/component.js
	Page      string `json:"page"`      // /component
	Component string `json:"component"` // Component
}

type PageBasedRouter []PageBasedRoute

var allowedFileTypes = []string{
	".js",  // JavaScript
	".jsx", // React JavaScript
	".ts",  // TypeScript           // TODO
	".tsx", // React TypeScript     // TODO
	".md",  // Markdown             // TODO
	".mdx", // MDX (React Markdown) // TODO
}

func isAllowedFileType(path string) bool {
	ext := filepath.Ext(path)
	for _, fileType := range allowedFileTypes {
		if ext == fileType {
			return true
		}
	}
	return false
}

func newPageBasedRoute(config Configuration, path string) PageBasedRoute {
	pg1 := len(config.PagesDir + "/")
	pg2 := len(path) - len(filepath.Ext(path)) // FIXME: This seems wrong
	route := PageBasedRoute{
		Path:      path,
		Page:      path[pg1:pg2],
		Component: "TODO",
	}
	return route
}

// loadRouter loads a page-based router.
func loadRouter(config Configuration) (PageBasedRouter, error) {
	var router PageBasedRouter
	if err := filepath.Walk(config.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		// TODO: Remove config.PagesDir from path.
		if isAllowedFileType(path) {
			router = append(router, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("cannot read pages; %w", err)
	}
	return router, nil
}
