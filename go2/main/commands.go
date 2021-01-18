package main

import (
	"io/ioutil"
	"os"
	"path"
	"path/filepath"

	"github.com/zaydek/retro/config"
)

// Retro is a namespace for commands.
type Retro struct{}

func (r Retro) version() {
	stdout.Println("0.0.x")
}

func (r Retro) init(rootDir string) {
	r.initImpl(rootDir)
}

func (r Retro) watch() {
	rc, err := config.InitConfiguration()
	if err != nil {
		stderr.Fatalln(err)
	}

	if err := rc.ServerGuards(); err != nil {
		stderr.Fatalln(err)
	}

	// TODO: Extract or attach to rc?
	srcs := []string{}
	err = filepath.Walk(rc.PagesDir, func(path string, info os.FileInfo, err error) error {
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

	bstr, err := renderPageProps(rc, srcs)
	if err != nil {
		stderr.Fatalln(err)
	}

	filename := path.Join(rc.CacheDir, "pageProps.js")
	data := []byte(`// THIS FILE IS AUTO-GENERATED.
// MOVE ALONG.

module.exports = ` + string(bstr))
	if err := ioutil.WriteFile(filename, data, 0644); err != nil {
		stderr.Fatalln(err)
	}
}

func (r Retro) build() {
	stderr.Println("😡 TODO")
}

func (r Retro) serve() {
	stderr.Println("😡 TODO")
}
