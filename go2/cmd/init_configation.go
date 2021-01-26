package main

import (
	"io"
	"os"
	pathpkg "path"
	"strconv"
	"time"

	"github.com/zaydek/retro/embedded"
	"github.com/zaydek/retro/errs"
)

// type RetroApp2 struct {
// 	esbuildResult   api.BuildResult
// 	esbuildWarnings []api.Message
// 	esbuildErrors   []api.Message
//
// 	WatchPoll      time.Duration
// 	WatchDirectory string
// 	BuildDirectory string
// 	ServePort      int
// }

// Configuration describes user configuration.
type Configuration struct {
	Env  string // The development or production flag
	Port int    // The development or production port

	WatchPoll        time.Duration // The poll duration for the watch command
	WatchDirectories []string
	AssetDirectory   string // The asset directory
	PagesDirectory   string // The pages directory
	CacheDirectory   string // The cache directory
	BuildDirectory   string // The build directory
	ReactStrictMode  bool   // Wrap <React.StrictMode>
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
	if _, err := os.Stat(pathpkg.Join(config.PagesDirectory, "index.html")); os.IsNotExist(err) {
		src, err := embedded.FS.Open("public/index.html")
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

func initConfiguration() (Configuration, error) {
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
		AssetDirectory:  assetDir,
		PagesDirectory:  pagesDir,
		CacheDirectory:  cacheDir,
		BuildDirectory:  buildDir,
		ReactStrictMode: reactStrictMode,
	}

	if err := runServerGuards(config); err != nil {
		return Configuration{}, err
	}
	return config, nil
}
