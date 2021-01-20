package main

import (
	"os"
	"path/filepath"
)

func (r Retro) cmdWatch() {
	// port := resolvePort()

	var err error
	if r.config, err = loadConfiguration(); err != nil {
		stderr.Fatalln(err)
	}

	// TODO: Extract to page-based router; loadPageBasedRoutes?
	srcs := []string{}
	err = filepath.Walk(r.config.PagesDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		// Step-over internal:
		if info.IsDir() && info.Name() == "internal" {
			return filepath.SkipDir
		}
		if !info.IsDir() {
			ext := filepath.Ext(path)
			if ext == ".js" || ext == ".jsx" || ext == ".ts" || ext == ".tsx" {
				srcs = append(srcs, path)
			}
		}
		return nil
	})
	if err != nil {
		stderr.Fatalln(err)
	}

	//	bstr, err := renderPageProps(r.config, srcs)
	//	if err != nil {
	//		stderr.Fatalln(err)
	//	}
	//
	//	filename := path.Join(r.config.CacheDir, "pageProps.js")
	//	data := []byte(`// THIS FILE IS AUTO-GENERATED.
	//// MOVE ALONG.
	//
	//module.exports = ` + string(bstr))
	//	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
	//		stderr.Fatalln(err)
	//	}
}
