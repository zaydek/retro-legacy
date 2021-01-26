package main

import (
	"io"
	"os"
	pathpkg "path"
	"path/filepath"

	"github.com/zaydek/retro/errs"
)

func copyAssetDirectoryToBuildDirectory(app *RetroApp) error {
	var paths []struct {
		src string
		dst string
	}

	if err := filepath.Walk(app.Configuration.AssetDirectory, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if !info.IsDir() && info.Name() != "index.html" {
			src := path
			dst := pathpkg.Join(app.Configuration.BuildDirectory, path)
			paths = append(paths, struct{ src, dst string }{src: src, dst: dst})
		}
		return nil
	}); err != nil {
		return errs.Walk(app.Configuration.AssetDirectory, err)
	}

	for _, each := range paths {
		if dir := pathpkg.Dir(each.dst); dir != "." {
			if err := os.MkdirAll(dir, 0755); err != nil {
				return errs.MkdirAll(dir, err)
			}
		}
		src, err := os.Open(each.src)
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(each.dst)
		if err != nil {
			return errs.Unexpected(err)
		}
		if _, err := io.Copy(src, dst); err != nil {
			return errs.Unexpected(err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}

func (app *RetroApp) build() {
	var err error
	if app.Configuration, err = initConfiguration(); err != nil {
		stderr.Println(err)
		os.Exit(1)
	} else if app.PageBasedRouter, err = initPageBasedRouter(app.Configuration); err != nil {
		stderr.Println(err)
		os.Exit(1)
	}

	must(copyAssetDirectoryToBuildDirectory(app))
	must(prerenderProps(app))
	must(prerenderApp(app))
	must(prerenderPages(app))
}
