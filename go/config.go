package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
)

// Global configuration.
type Configuration struct {
	// Wrap the app with `<React.StrictMode>`. Defaults to `false`.
	ReactStrictMode bool

	// The pages directory. Defaults to `"pages"`.
	pagesDir string

	// The cache directory. Defaults to `"cache"`.
	cacheDir string

	// The build directory. Defaults to `"build"`.
	buildDir string
}

// Defaults for an uninitialized configuration.
var configDefaults = Configuration{
	ReactStrictMode: false,
	pagesDir:        "pages",
	cacheDir:        "cache",
	buildDir:        "build",
}

// Initializes a configuration file. If no such configuration file exists, a
// pre-initialized configuration will be written to disk and returned.
//
// TODO: Shouldn’t `pathStr` be assumed to be `"x.config.json"`?
// TODO: We do not currently commit the pre-initialized configuration file to
// disk. See `main.go` for current implementation.
// TODO: Add unit tests.
func InitConfigurationFile(path string) (*Configuration, error) {
	config := &Configuration{}

	// Read from disk; if no configuration file exists, write and return the pre-
	// initialized configuration.
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		*config = configDefaults
		b, err := json.MarshalIndent(config, "", "\t")
		if err != nil {
			return nil, fmt.Errorf("attempted to write a pre-initialized configuration file to disk but failed; %w", err)
		}
		err = ioutil.WriteFile("config.json", b, os.ModePerm)
		if err != nil {
			return nil, fmt.Errorf("attempted to write a pre-initialized configuration file to disk but failed; %w", err)
		}
		log.Print("no such configuration file; initialized from recommended defaults")
		return config, nil
	}

	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, config)
	if err != nil {
		return nil, err
	}

	// TODO: Can probably use reflection here. Check for zero values and
	// iteratively assign default values from `configDefaults`.
	if config.pagesDir == "" {
		config.pagesDir = "pages"
	}
	if config.cacheDir == "" {
		config.cacheDir = "cache"
	}
	if config.buildDir == "" {
		config.buildDir = "build"
	}

	// TODO: Add server guards here; guarantee the presence or the creation of
	// required directories. This is important for `GetPageBasedRoutes` to work
	// correctly.

	return config, nil
}
