package svetlana

import (
	"os"
	p "path"
	"path/filepath"
	"strings"
)

var supported = map[string]bool{
	".svelte": true,
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

func newPageBasedRoute(config DirectoryConfiguration, path string) PageBasedRoute {
	var src string
	var dst string

	basename := path[len(config.PagesDirectory+"/"):]

	src = p.Join(config.PagesDirectory, basename)
	dst = p.Join(config.BuildDirectory, basename)
	dst = dst[:len(dst)-len(p.Ext(dst))] + ".html"

	route := PageBasedRoute{
		SrcPath:   src,
		DstPath:   dst,
		Path:      pathSyntax(basename),
		Component: componentSyntax(basename),
	}
	return route
}

func newRouter(config DirectoryConfiguration) ([]PageBasedRoute, error) {
	var routes []PageBasedRoute
	if err := filepath.Walk(config.PagesDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// if info.IsDir() && info.Name() == "internal" {
		// 	return filepath.SkipDir
		// }
		if ext := p.Ext(path); supported[ext] {
			routes = append(routes, newPageBasedRoute(config, path))
		}
		return nil
	}); err != nil {
		return nil, err
	}
	return routes, nil
}
