package config

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"regexp"
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

// Matches comments:
//
// - [ \t]*       spaces
// - \/\/         //
// - .*           any (to EOL)
//
// - \/\*         /*
// - (?:\n?.*?)+  one or more paragraphs (lazy)
// - \*\/         */
//
// TODO: Add tests.
var commentRe = regexp.MustCompile(`[ \t]*\/\/.*` + `|` + `\/\*(?:\n?.*?)+\*\/`)

// InitConfiguration loads or creates retro.config.jsonc.
//
// TODO: Add support for user overriding configuration fields using
// environmental variables; environmental variables take precedence over
// configuration fields.
// TODO: Add support for JavaScript (or TypeScript-based?) configuration files.
// TODO: Remove comments from jsonc before calling unmarshal.
func InitConfiguration() (Configuration, error) {
	config := Configuration{
		PublicDir:       "public",
		PagesDir:        "pages",
		CacheDir:        "cache",
		BuildDir:        "build",
		ReactStrictMode: false,
	}
	// Stat or create retro.config.jsonc:
	if _, err := os.Stat("retro.config.jsonc"); os.IsNotExist(err) {
		bstr, err := json.MarshalIndent(config, "", "\t")
		if err != nil {
			return Configuration{}, fmt.Errorf("cannot write retro.config.jsonc; %w", err)
		}
		bstr = append(bstr, '\n') // EOF
		if err := ioutil.WriteFile("retro.config.jsonc", bstr, 0644); err != nil {
			return Configuration{}, fmt.Errorf("cannot write retro.config.jsonc; %w", err)
		}
	}
	// Read retro.config.jsonc:
	bstr, err := ioutil.ReadFile("retro.config.jsonc")
	if err != nil {
		return Configuration{}, fmt.Errorf("cannot read retro.config.jsonc; %w", err)
	}
	// Remove comments:
	bstr = commentRe.ReplaceAll(bstr, []byte(""))
	if err = json.Unmarshal(bstr, &config); err != nil {
		return Configuration{}, fmt.Errorf("cannot read retro.config.jsonc; %w", err)
	}
	return config, nil
}

// ServerGuards guard for the presence of PagesDir, CacheDir, and BuildDir.
func (c Configuration) ServerGuards() error {
	// TODO: Add guards for public/index.html?

	// // PagesDir
	// if info, err := os.Stat(c.PublicDir); os.IsNotExist(err) {
	// 	if err := os.MkdirAll(c.PublicDir, 0755); err != nil {
	// 		return fmt.Errorf("server guard: cannot create a directory for configuration field PAGES_DIR=%q; %w", c.PublicDir, err)
	// 	}
	// } else if !info.IsDir() {
	// 	return fmt.Errorf("server guard: configuration field PAGES_DIR=%q must be a directory", c.PublicDir)
	// }

	// CacheDir
	if info, err := os.Stat(c.CacheDir); os.IsNotExist(err) {
		if err := os.MkdirAll(c.CacheDir, 0755); err != nil {
			return fmt.Errorf("server guard: cannot create a directory for configuration field CACHE_DIR=%q; %w", c.PublicDir, err)
		}
	} else if !info.IsDir() {
		return fmt.Errorf("server guard: configuration field CACHE_DIR=%q must be a directory", c.PublicDir)
	}
	// BuildDir
	if info, err := os.Stat(c.BuildDir); os.IsNotExist(err) {
		if err := os.MkdirAll(c.BuildDir, 0755); err != nil {
			return fmt.Errorf("server guard: cannot create a directory for configuration field BUILD_DIR=%q; %w", c.PublicDir, err)
		}
	} else if !info.IsDir() {
		return fmt.Errorf("server guard: configuration field BUILD_DIR=%q must be a directory", c.PublicDir)
	}
	return nil
}
