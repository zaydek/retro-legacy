package main

import (
	"encoding/json"
	"errors"
	"io/ioutil"
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
var configurationDefaults = Configuration{
	ReactStrictMode: false,
	pagesDir:        "pages",
	cacheDir:        "cache",
	buildDir:        "build",
}

// Reads a configuration file (encoded as JSON) from the user. Returns a
// pre-initialized configuration if no such configuration exists. Default values
// are documented in the `Configuration` struct declaration.
//
// TODO: Add unit tests.
func ReadConfigurationFile(pathstr string) (*Configuration, error) {
	conf := &Configuration{}

	// No such configuration file; return a pre-initialized configuration:
	info, err := os.Stat(pathstr)
	if os.IsNotExist(err) {
		*conf = configurationDefaults
		return conf, nil
	}

	if info.IsDir() {
		return nil, errors.New("configuration file must be a JSON-encoded file")
	}
	b, err := ioutil.ReadFile("go/conf.json")
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, conf)
	if err != nil {
		return nil, err
	}

	// TODO: Can probably use reflection here. Check for zero values and
	// iteratively assign default values from `configurationDefaults`.
	if conf.pagesDir == "" {
		conf.pagesDir = "pages"
	}
	if conf.cacheDir == "" {
		conf.cacheDir = "cache"
	}
	if conf.buildDir == "" {
		conf.buildDir = "build"
	}

	return conf, nil
}
