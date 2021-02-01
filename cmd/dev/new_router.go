package dev

import (
	"os"
	p "path"
	"path/filepath"
	"strings"

	"github.com/zaydek/retro/pkg/errs"
)

var supported = map[string]bool{
	".js":  true,
	".jsx": true,
	".ts":  true,
	".tsx": true,
	".md":  true,
	".mdx": true,
}

func name(basename string) string {
	return basename[:len(basename)-len(p.Ext(basename))]
}

// pathCase returns the page case for a path.
func pathCase(basename string) string {
	var str string

	str = "/" + name(basename)
	str = strings.TrimSuffix(str, "index")
	return str
}

// componentCase returns the component case for a path.
func componentCase(basename string) string {
	var str string

	for x := 0; x < len(name(basename)); x++ {
		switch basename[x] {
		case '/':
			x++
			if x < len(basename) {
				str += strings.ToUpper(string(basename[x]))
			}
		case '-':
			x++
			if x < len(basename) {
				str += strings.ToUpper(string(basename[x]))
			}
		default:
			str += string(basename[x])
		}
	}
	str = "Page" + strings.ToUpper(str[0:1]) + str[1:]
	return str
}

// Creates a new page-baed route.
func newPageBasedRoute(config DirectoryConfiguration, path string) PageBasedRoute {
	var src, dst string

	// Get the basename from pages/*.
	basename := path[len(config.PagesDirectory):]

	src = p.Join(config.PagesDirectory, basename)
	dst = p.Join(config.BuildDirectory, basename)
	dst = dst[:len(dst)-len(p.Ext(dst))] + ".html"

	route := PageBasedRoute{
		SrcPath:   src,
		DstPath:   dst,
		Path:      pathCase(basename),
		Component: componentCase(basename),
	}
	return route
}

// newRouter creates a new page-based router.
func newRouter(config DirectoryConfiguration) ([]PageBasedRoute, error) {
	var routes []PageBasedRoute
	if err := filepath.Walk(config.PagesDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if ext := p.Ext(path); supported[ext] != false {
			routes = append(routes, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, errs.Walk(config.PagesDirectory, err)
	}
	return routes, nil
}
