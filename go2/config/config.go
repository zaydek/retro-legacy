package config

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
)

// Configuration describes global configuration.
type Configuration struct {
	// The public directory.
	PublicDir string `JSON:"PUBLIC_DIR"`

	// The pages directory.
	PagesDir string `json:"PAGES_DIR"`

	// The cache directory.
	CacheDir string `json:"CACHE_DIR"`

	// The build directory.
	BuildDir string `json:"BUILD_DIR"`

	// Wrap the app with <React.StrictMode>.
	ReactStrictMode bool
}

var defaultConfig = Configuration{
	PublicDir:       "public",
	PagesDir:        "pages",
	CacheDir:        "cache",
	BuildDir:        "build",
	ReactStrictMode: false,
}

// LoadOrCreateConfiguration loads or creates retro.config.jsonc.
//
// TODO: Add support for user overriding configuration fields using
// environmental variables; environmental variables take precedence over
// configuration fields.
// TODO: Add support for JavaScript (or TypeScript-based?) configuration files.
// TODO: Remove comments from jsonc before calling unmarshal.
func LoadOrCreateConfiguration() (Configuration, error) {
	config := defaultConfig

	// Assert the presence of retro.config.jsonc:
	_, err := os.Stat("retro.config.jsonc")
	if os.IsNotExist(err) {
		bstr, err := json.MarshalIndent(config, "", "\t")
		if err != nil {
			return Configuration{}, fmt.Errorf("cannot write retro.config.jsonc; %w", err)
		}
		bstr = append(bstr, '\n')
		err = ioutil.WriteFile("retro.config.jsonc", bstr, 0644)
		if err != nil {
			return Configuration{}, fmt.Errorf("cannot write retro.config.jsonc; %w", err)
		}
	}

	// Read retro.config.jsonc:
	bstr, err := ioutil.ReadFile("retro.config.jsonc")
	if err != nil {
		return Configuration{}, fmt.Errorf("cannot read retro.config.jsonc; %w", err)
	}
	dec := json.NewDecoder(bytes.NewReader(bstr))
	dec.DisallowUnknownFields()
	err = dec.Decode(&config)
	if err != nil {
		return Configuration{}, fmt.Errorf("cannot read retro.config.jsonc; %w", err)
	}

	// Server guards:
	fi, err := os.Stat(config.PublicDir)
	if os.IsNotExist(err) {
		err := os.MkdirAll(config.PublicDir, 0755)
		if err != nil {
			return Configuration{}, fmt.Errorf("server guard: cannot create a directory for configuration field PUBLIC_DIR=%q; %w", config.PublicDir, err)
		}
	} else if !fi.IsDir() {
		return Configuration{}, fmt.Errorf("server guard: configuration field PUBLIC_DIR=%q must be a directory", config.PublicDir)
	}
	fi, err = os.Stat(config.PagesDir)
	if os.IsNotExist(err) {
		err := os.MkdirAll(config.PagesDir, 0755)
		if err != nil {
			return Configuration{}, fmt.Errorf("server guard: cannot create a directory for configuration field PAGES_DIR=%q; %w", config.PagesDir, err)
		}
	} else if !fi.IsDir() {
		return Configuration{}, fmt.Errorf("server guard: configuration field PAGES_DIR=%q must be a directory", config.PagesDir)
	}
	fi, err = os.Stat(config.CacheDir)
	if os.IsNotExist(err) {
		err := os.MkdirAll(config.CacheDir, 0755)
		if err != nil {
			return Configuration{}, fmt.Errorf("server guard: cannot create a directory for configuration field CACHE_DIR=%q; %w", config.CacheDir, err)
		}
	} else if !fi.IsDir() {
		return Configuration{}, fmt.Errorf("server guard: configuration field CACHE_DIR=%q must be a directory", config.CacheDir)
	}
	fi, err = os.Stat(config.BuildDir)
	if os.IsNotExist(err) {
		err := os.MkdirAll(config.BuildDir, 0755)
		if err != nil {
			return Configuration{}, fmt.Errorf("server guard: cannot create a directory for configuration field BUILD_DIR=%q; %w", config.BuildDir, err)
		}
	} else if !fi.IsDir() {
		return Configuration{}, fmt.Errorf("server guard: configuration field BUILD_DIR=%q must be a directory", config.BuildDir)
	}

	return config, nil
}
