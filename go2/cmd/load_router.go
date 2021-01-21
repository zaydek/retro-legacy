package main

import (
	"fmt"
	"os"
	"path/filepath"
	"strings"
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

// toPageCase returns the page case for a path.
//
// TODO: Add tests.
func toPageCase(config Configuration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDir)
	path = path[:len(path)-len(filepath.Ext(path))]

	// TODO: What about /nested/?
	str := strings.TrimSuffix(path, "index")
	return str
}

// toComponentCase returns the component case for a path.
//
// TODO: Add tests.
func toComponentCase(config Configuration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDir+"/") // Add "/"
	path = path[:len(path)-len(filepath.Ext(path))]

	str := "Page"
	for x := 0; x < len(path); x++ {
		if x == 0 {
			str += strings.ToUpper(path[0:1])
			continue
		}
		switch path[x] {
		case '/':
			str += "__"
			x++
			if x < len(path) {
				str += strings.ToUpper(string(path[x]))
			}
		case '-':
			str += "_"
			x++
			if x < len(path) {
				str += strings.ToUpper(string(path[x]))
			}
		default:
			str += string(path[x])
		}
	}
	return str
}

// Creates a new page-based route from a route.
func newPageBasedRoute(config Configuration, path string) PageBasedRoute {
	route := PageBasedRoute{
		Path:      path,
		Page:      toPageCase(config, path),
		Component: toComponentCase(config, path),
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
		if isAllowedFileType(path) {
			router = append(router, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, fmt.Errorf("failed to read page-based routes; %w", err)
	}
	return router, nil
}
