package main

import (
	"time"

	"github.com/evanw/esbuild/pkg/api"
)

type RetroApp struct {
	esbuildResult   api.BuildResult
	esbuildWarnings []api.Message
	esbuildErrors   []api.Message

	Env  string // The development or production flag
	Port int    // The development or production port

	WatchPoll        time.Duration
	WatchDirectories []string

	AssetDirectory string // The asset directory
	PagesDirectory string // The pages directory
	CacheDirectory string // The cache directory
	BuildDirectory string // The build directory

	ReactStrictModeEnabled bool // Wrap <React.StrictMode>
	ReactSuspenseEnabled   bool // Wrap <React.Suspense>

	PageBasedRouter []PageBasedRoute
}
