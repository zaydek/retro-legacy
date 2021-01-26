package main

import (
	"io"
	"os"
	pathpkg "path"

	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
)

// statOrCreateDir stats for the presence of a directory or creates one.
func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

// statOrCreateEntryPoint stats for the presence of a the index.html entry point
// or creates one.
//
// NOTE: embedded.JavaScriptFS.Open("public/index.html") and
// embedded.TypeScriptFS.Open("public/index.html") should be equivalent.
func statOrCreateEntryPoint(config Configuration) error {
	if _, err := os.Stat(pathpkg.Join(config.PagesDirectory, "index.html")); os.IsNotExist(err) {
		src, err := embedded.JavaScriptFS.Open("public/index.html")
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(pathpkg.Join(config.AssetDirectory, "index.html"))
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

// runServerGuards runs server guards on the configuration.
func runServerGuards(config Configuration) error {
	dirs := []string{config.AssetDirectory, config.PagesDirectory, config.CacheDirectory, config.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	if err := statOrCreateEntryPoint(config); err != nil {
		return err
	}
	return nil
}

// loadConfig loads the configuration.
func loadConfig() (Configuration, error) {
	config := Configuration{
		AssetDirectory: "public",
		PagesDirectory: "pages",
		CacheDirectory: "cache",
		BuildDirectory: "build",
	}
	if err := runServerGuards(config); err != nil {
		return Configuration{}, err
	}
	return config, nil
}
