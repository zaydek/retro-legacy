package main

import (
	"fmt"
	"os"
	"path/filepath"
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
	// rc, err := config.LoadOrCreateConfiguration()
	// if err != nil {
	// 	stderr.Println(err)
	// }

	srcs := []string{}
	err := filepath.Walk("retro-app/pages", func(path string, info os.FileInfo, err error) error {
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
	bstr, err := renderPageProps(srcs)
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
