package main

import (
	"encoding/json"
	"errors"
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

// Server guards.
func (c *Configuration) serverGuards() error {
	// PAGES_DIR
	info, err := os.Stat(c.PagesDir)
	if os.IsNotExist(err) {
		err := os.Mkdir(c.PagesDir, os.ModePerm)
		if err != nil {
			return err
		}
	} else if !info.IsDir() {
		return errors.New("cannot proceed; configuration field `PAGES_DIR` must be a directory")
	}

	// CACHE_DIR
	info, err = os.Stat(c.CacheDir)
	if os.IsNotExist(err) {
		err := os.Mkdir(c.CacheDir, os.ModePerm)
		if err != nil {
			return err
		}
	} else if !info.IsDir() {
		return errors.New("cannot proceed; configuration field `CACHE_DIR` must be a directory")
	}

	// BUILD_DIR
	info, err = os.Stat(c.BuildDir)
	if os.IsNotExist(err) {
		err := os.Mkdir(c.BuildDir, os.ModePerm)
		if err != nil {
			return err
		}
	} else if !info.IsDir() {
		return errors.New("cannot proceed; configuration field `BUILD_DIR` must be a directory")
	}
	// Server guards pass; OK to proceed.
	return nil
}

// Initializes a configuration file. If no such configuration file exists, a
// pre-initialized configuration will be written to disk and returned.
//
// TODO: Upgrade implementation to support JS or TS-based configuration files?
// TODO: Add unit tests.
func InitConfiguration(path string) (*Configuration, error) {
	config := &Configuration{}

	// Read from disk; if no configuration file exists, write and return the pre-
	// initialized configuration.
	_, err := os.Stat(path)
	if os.IsNotExist(err) {
		*config = configDefaults
		b, err := json.MarshalIndent(config, "", "\t")
		if err != nil {
			return nil, fmt.Errorf("attempted to write config.json to disk but failed; %w", err)
		}
		err = ioutil.WriteFile("config.json", append(b, []byte("\n")...), os.ModePerm)
		if err != nil {
			return nil, fmt.Errorf("attempted to write config.json to disk but failed; %w", err)
		}
		// TODO: Technically, ths implementation leads to double-reading the
		// configuration file, which is fine but also a little weird.
		path = "config.json"
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

	err = config.serverGuards()
	if err != nil {
		return nil, err
	}

	return config, nil
}
