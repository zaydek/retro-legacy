package main

import (
	"io"
	"os"
	pathpkg "path"

	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
)

// Configuration describes user configuration.
type Configuration struct {
	// The asset directory.
	AssetDir string `json:"ASSET_DIR"`

	// The pages directory.
	PagesDir string `json:"PAGES_DIR"`

	// The cache directory.
	CacheDir string `json:"CACHE_DIR"`

	// The build directory.
	BuildDir string `json:"BUILD_DIR"`

	// Wrap <React.StrictMode>.
	//
	// TODO: Extract to options?
	ReactStrictMode bool
}

func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

func statOrCreateEntryPoint(config Configuration) error {
	if _, err := os.Stat(pathpkg.Join(config.PagesDir, "index.html")); os.IsNotExist(err) {
		src, err := embedded.FS.Open("public/index.html")
		if err != nil {
			return errs.Unexpected(err)
		}
		dst, err := os.Create(pathpkg.Join(config.AssetDir, "index.html"))
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

func serverGuards(config Configuration) error {
	dirs := []string{config.AssetDir, config.PagesDir, config.CacheDir, config.BuildDir}
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

func loadConfiguration() (Configuration, error) {
	config := Configuration{AssetDir: "public", PagesDir: "pages", CacheDir: "cache", BuildDir: "build", ReactStrictMode: false}
	if err := serverGuards(config); err != nil {
		return Configuration{}, err
	}
	return config, nil
}
