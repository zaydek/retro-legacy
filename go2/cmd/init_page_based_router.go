package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/zaydek/retro/errs"
)

// PageBasedRoute describes a page-based route from pages/*.
type PageBasedRoute struct {
	FSPath    string `json:"fs_path"`   // pages/path/to/component.js
	Path      string `json:"path"`      // path/to/component
	Component string `json:"component"` // Component
}

var allowedRouteFileTypes = []string{
	".js",  // JavaScript
	".jsx", // React JavaScript
	".ts",  // TypeScript           // TODO
	".tsx", // React TypeScript     // TODO
	".md",  // Markdown             // TODO
	".mdx", // MDX (React Markdown) // TODO
}

func isAllowedRouteFileType(path string) bool {
	ext := filepath.Ext(path)
	for _, each := range allowedRouteFileTypes {
		if each == ext {
			return true
		}
	}
	return false
}

// toPathCase returns the page case for a path.
//
// TODO: Add tests.
func toPathCase(config Configuration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDirectory)
	path = path[:len(path)-len(filepath.Ext(path))]

	// TODO: What about /nested/?
	str := strings.TrimSuffix(path, "index")
	return str
}

// toComponentCase returns the component case for a path.
//
// TODO: Add tests.
func toComponentCase(config Configuration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDirectory+"/") // Add "/"
	path = path[:len(path)-len(filepath.Ext(path))]

	var str string
	for x := 0; x < len(path); x++ {
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
	str = strings.ToUpper(str[0:1]) + str[1:]
	return str
}

func newPageBasedRoute(config Configuration, path string) PageBasedRoute {
	route := PageBasedRoute{
		FSPath:    path,
		Path:      toPathCase(config, path),
		Component: toComponentCase(config, path),
	}
	return route
}

func initPageBasedRouter(config Configuration) ([]PageBasedRoute, error) {
	var routes []PageBasedRoute
	if err := filepath.Walk(config.PagesDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if isAllowedRouteFileType(path) {
			routes = append(routes, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, errs.Walk(config.PagesDirectory, err)
	}
	return routes, nil
}
