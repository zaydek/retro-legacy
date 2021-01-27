package main

import (
	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cli"
)

// PageBasedRoute describes a page-based route from pages/* or src/pages/*.
type PageBasedRoute struct {
	FSPath    string `json:"fs_path"`   // pages/path/to/component.js
	Path      string `json:"path"`      // path/to/component
	Component string `json:"component"` // Component
}

// DirConfiguration describes persistent directory configuration.
type DirConfiguration struct {
	AssetDirectory string
	PagesDirectory string
	CacheDirectory string
	BuildDirectory string
}

type Runtime struct {
	esbuildResult   api.BuildResult
	esbuildWarnings []api.Message
	esbuildErrors   []api.Message

	cli.Commands
	Config DirConfiguration
	Router []PageBasedRoute
}

// ExperimentalReactSuspenseEnabled   bool // Wrap <React.Suspense>
// ExperimentalReactStrictModeEnabled bool // Wrap <React.StrictMode>
