package main

import (
	"io"
	"os"
	pathpkg "path"

	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
)

func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

func statOrCreateEntryPoint(run Runtime) error {
	if _, err := os.Stat(pathpkg.Join(run.PagesDirectory, "index.html")); os.IsNotExist(err) {
		src, err := embedded.JavaScriptFS.Open("public/index.html")
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(pathpkg.Join(run.AssetDirectory, "index.html"))
		if err != nil {
			return errs.Unexpected(err)
		}
		if _, err := io.Copy(dst, src); err != nil {
			return errs.Unexpected(err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}

func runServerGuards(run Runtime) error {
	dirs := []string{run.AssetDirectory, run.PagesDirectory, run.CacheDirectory, run.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	if err := statOrCreateEntryPoint(run); err != nil {
		return err
	}
	return nil
}
