package cmd

import (
	"github.com/evanw/esbuild/pkg/api"
)

// PageBasedRoute describes a page-based route from pages/* or src/pages/*.
type PageBasedRoute struct {
	// TODO
	FSPath string `json:"fs_path"` // pages/path/to/component.js

	DiskPathSrc string `json:"diskPathSrc"` // pages/path/to/component.js
	DiskPathDst string `json:"diskPathDst"` // build/path/to/component.html
	Path        string `json:"path"`        // path/to/component
	Component   string `json:"component"`   // Component
}

// DirConfiguration describes persistent directory configuration.
type DirConfiguration struct {
	AssetDirectory string
	PagesDirectory string
	CacheDirectory string
	BuildDirectory string
}

// TODO: We need a way of preventing the same error from logging twice. May want
// some kind of fingerprint for warnings and errors.
type Runtime struct {
	// Unexported
	epochUUID       string
	esbuildResult   api.BuildResult
	esbuildWarnings []api.Message
	esbuildErrors   []api.Message

	// Exported
	Command interface{}
	Config  DirConfiguration
	Router  []PageBasedRoute
}

// ExperimentalReactSuspenseEnabled   bool // Wrap <React.Suspense>
// ExperimentalReactStrictModeEnabled bool // Wrap <React.StrictMode>
