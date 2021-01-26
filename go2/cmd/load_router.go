package main

import (
	"os"
	"path/filepath"
	"strings"

	"github.com/zaydek/retro/errs"
)

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
func toPathCase(config DirConfiguration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDirectory)
	path = path[:len(path)-len(filepath.Ext(path))]

	// TODO: What about /nested/?
	str := strings.TrimSuffix(path, "index")
	return str
}

// toComponentCase returns the component case for a path.
//
// TODO: Add tests.
func toComponentCase(config DirConfiguration, path string) string {
	path = strings.TrimPrefix(path, config.PagesDirectory+"/") // Add "/"
	path = path[:len(path)-len(filepath.Ext(path))]

	var str string
	for x := 0; x < len(path); x++ {
		switch path[x] {
		case '/':
			x++
			if x < len(path) {
				str += strings.ToUpper(string(path[x]))
			}
		case '-':
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

func newPageBasedRoute(config DirConfiguration, path string) PageBasedRoute {
	route := PageBasedRoute{
		FSPath:    path,
		Path:      toPathCase(config, path),
		Component: toComponentCase(config, path),
	}
	return route
}

// loadRouter loads the page-based router.
func loadRouter(config DirConfiguration) ([]PageBasedRoute, error) {
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
