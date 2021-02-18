package retro

import (
	"os"
	p "path"
	"path/filepath"
	"strings"
)

var supported = map[string]bool{
	".js":  true,
	".jsx": true,
	".ts":  true, // TODO?
	".tsx": true,
}

func name(basename string) string {
	return basename[:len(basename)-len(p.Ext(basename))]
}

// pathSyntax returns the page syntax for a path.
func pathSyntax(basename string) string {
	var str string

	str = "/" + name(basename)
	str = strings.TrimSuffix(str, "index")
	return str
}

// componentSyntax returns the component syntax for a path.
//
// TODO: Edge cases: -- (two or more) and spaces.
func componentSyntax(basename string) string {
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

func newPageBasedRoute(config DirectoryConfiguration, path string) FilesystemRoute {
	var src string
	var dst string

	basename := path[len(config.PagesDir+"/"):]

	src = p.Join(config.PagesDir, basename)
	dst = p.Join(config.ExportDir, basename)
	dst = dst[:len(dst)-len(p.Ext(dst))] + ".html"

	route := FilesystemRoute{
		InputPath:  src,
		OutputPath: dst,
		Path:       pathSyntax(basename),
		Component:  componentSyntax(basename),
	}
	return route
}

func newFilesystemRoutere(config DirectoryConfiguration) ([]FilesystemRoute, error) {
	var routes []FilesystemRoute
	if err := filepath.Walk(config.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Step over:
		//
		// - _page.js
		// - page_.js
		//
		// - $page.js
		// - page$.js
		//
		base := p.Base(path)
		name := base[:len(base)-len(p.Ext(base))]
		if strings.HasPrefix(name, "_") || strings.HasSuffix(name, "_") ||
			strings.HasPrefix(name, "$") || strings.HasSuffix(name, "$") {
			return nil
		}
		if ext := p.Ext(path); supported[ext] {
			routes = append(routes, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, err
	}
	return routes, nil
}
