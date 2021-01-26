package main

import (
	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/cli"
)

type Runtime struct {
	esbuildResult   api.BuildResult
	esbuildWarnings []api.Message
	esbuildErrors   []api.Message

	cli.Commands

	AssetDirectory string
	PagesDirectory string
	CacheDirectory string
	BuildDirectory string

	PageBasedRouter []PageBasedRoute
}

// ExperimentalReactSuspenseEnabled   bool // Wrap <React.Suspense>
// ExperimentalReactStrictModeEnabled bool // Wrap <React.StrictMode>
