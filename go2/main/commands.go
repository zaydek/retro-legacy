package main

import (
	"fmt"
	"os"
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
	out := `// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

module.exports = ` + string(bstr)

	fmt.Print(out)
}

func (r Retro) build() {
	stderr.Println("😡 TODO")
}

func (r Retro) serve() {
	stderr.Println("😡 TODO")
}
