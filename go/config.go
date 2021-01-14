package main

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

type Configuration struct {
	// The pages directory.
	PagesDir string `json:"PAGES_DIR"`

	// The cache directory.
	CacheDir string `json:"CACHE_DIR"`

	// The build directory.
	BuildDir string `json:"BUILD_DIR"`

	// Should wrap the app with `<React.StrictMode>`.
	ReactStrictMode bool
}

// Defaults for an uninitialized configuration.
var configDefaults = Configuration{
	PagesDir:        "pages",
	CacheDir:        "cache",
	BuildDir:        "build",
	ReactStrictMode: false,
}

// Initializes a configuration file. If no such configuration file exists, a
// pre-initialized configuration will be written to disk and returned.
//
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
		err = ioutil.WriteFile("config.json", append(b, []byte("\n")...), os.ModePerm)
		if err != nil {
			return nil, fmt.Errorf("attempted to write a pre-initialized configuration file to disk but failed; %w", err)
		}
		fmt.Printf("no such configuration file; initialized from recommended defaults\n")
		fmt.Printf("wrote %s to disk\n", "config.json")
		return config, nil
	}

	b, err := ioutil.ReadFile(path)
	if err != nil {
		return nil, err
	}
	// TODO: Add graceful error-handling for missing fields, etc.
	err = json.Unmarshal(b, config)
	if err != nil {
		return nil, err
	}

	// TODO: Can probably use reflection here. Check for zero values and
	// iteratively assign default values from `configDefaults`.
	if config.PagesDir == "" {
		config.PagesDir = configDefaults.PagesDir
	}
	if config.CacheDir == "" {
		config.CacheDir = configDefaults.CacheDir
	}
	if config.BuildDir == "" {
		config.BuildDir = configDefaults.BuildDir
	}

	// TODO: Add server guards here; guarantee the presence or the creation of
	// required directories. This is important for `GetPageBasedRoutes` to work
	// correctly.
	//
	// If `pagesDir` does not exist; create it. If `cacheDir` does not exist,
	// create it, if `buildDir` does not exists, create it.

	return config, nil
}
