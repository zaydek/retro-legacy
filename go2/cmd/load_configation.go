package main

import (
	"io"
	"os"
	pathpkg "path"
	"strconv"

	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
)

// Configuration describes user configuration.
type Configuration struct {
	Env             string // The development or production flag
	Port            int    // The development or production port
	AssetDir        string // The asset directory
	PagesDir        string // The pages directory
	CacheDir        string // The cache directory
	BuildDir        string // The build directory
	ReactStrictMode bool   // Wrap <React.StrictMode>
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

func runServerGuards(config Configuration) error {
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
	var (
		env             string
		port            int
		assetDir        string
		pagesDir        string
		cacheDir        string
		buildDir        string
		reactStrictMode bool
	)

	env = os.Getenv("NODE_ENV")
	if env != "development" && env != "production" {
		env = "development"
	}
	port, _ = strconv.Atoi(os.Getenv("PORT"))
	if port == 0 {
		port = 8000
	}
	assetDir = os.Getenv("ASSET_DIR")
	if assetDir == "" {
		assetDir = "public"
	}
	pagesDir = os.Getenv("PAGES_DIR")
	if pagesDir == "" {
		pagesDir = "pages"
	}
	cacheDir = os.Getenv("CACHE_DIR")
	if cacheDir == "" {
		cacheDir = "cache"
	}
	buildDir = os.Getenv("BUILD_DIR")
	if buildDir == "" {
		buildDir = "build"
	}
	reactStrictMode, _ = strconv.ParseBool(os.Getenv("REACT_STRICT_MODE"))

	config := Configuration{
		Env:             env,
		Port:            port,
		AssetDir:        assetDir,
		PagesDir:        pagesDir,
		CacheDir:        cacheDir,
		BuildDir:        buildDir,
		ReactStrictMode: reactStrictMode,
	}

	if err := runServerGuards(config); err != nil {
		return Configuration{}, err
	}
	return config, nil
}
