package main

import (
	"fmt"
	"io"
	"os"
	"path"

	"github.com/zaydek/retro/embedded"
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

func checkDir(field, dir string) error {
	if info, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return fmt.Errorf("server guard: failed to create directory for configuration field %s=%s; %w", field, dir, err)
		}
	} else if !info.IsDir() {
		return fmt.Errorf("server guard: configuration field %s=%s must be a directory", field, dir)
	}
	return nil
}

func checkPublicIndexHTML(config Configuration) error {
	if _, err := os.Stat(path.Join(config.PagesDir, "index.html")); os.IsNotExist(err) {
		src, err := embedded.FS.Open("public/index.html")
		if err != nil {
			return fmt.Errorf("failed to write %s/index.html; %w", config.AssetDir, err)
		}
		dst, err := os.Create(path.Join(config.AssetDir, "index.html"))
		if err != nil {
			return fmt.Errorf("failed to write %s/index.html; %w", config.AssetDir, err)
		}
		if _, err := io.Copy(dst, src); err != nil {
			return fmt.Errorf("failed to write %s/index.html; %w", config.AssetDir, err)
		}
		src.Close()
		dst.Close()
	}
	return nil
}

func serverGuards(config Configuration) error {
	dirs := []struct {
		field string
		dir   string
	}{
		{field: "ASSET_DIR", dir: config.AssetDir},
		{field: "PAGES_DIR", dir: config.PagesDir},
		{field: "CACHE_DIR", dir: config.CacheDir},
		{field: "BUILD_DIR", dir: config.BuildDir},
	}
	for _, each := range dirs {
		if err := checkDir(each.field, each.dir); err != nil {
			return err
		}
	}
	if err := checkPublicIndexHTML(config); err != nil {
		return err
	}
	return nil
}

// loadConfiguration loads or creates retro.config.jsonc.
func loadConfiguration() (Configuration, error) {
	config := Configuration{AssetDir: "public", PagesDir: "pages", CacheDir: "cache", BuildDir: "build", ReactStrictMode: false}
	if err := serverGuards(config); err != nil {
		return Configuration{}, err
	}
	return config, nil
}
