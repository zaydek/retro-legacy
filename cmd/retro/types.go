package retro

import (
	"text/template"

	"github.com/evanw/esbuild/pkg/api"
)

type Cmd uint8

const (
	CmdStart Cmd = iota // Zero value
	CmdBuild
	CmdServe
)

// PageBasedRoute describes a page-based route.
type PageBasedRoute struct {
	SrcPath   string `json:"srcPath"`   // pages/path/to/component.js
	DstPath   string `json:"dstPath"`   // build/path/to/component.html
	Path      string `json:"path"`      // path/to/component
	Component string `json:"component"` // Component
}

// DirectoryConfiguration describes persistent directory configuration.
type DirectoryConfiguration struct {
	AssetDirectory string
	PagesDirectory string
	CacheDirectory string
	BuildDirectory string
}

type Runtime struct {
	// Unexported
	esbuildErrors   []api.Message
	esbuildWarnings []api.Message
	baseTemplate    *template.Template

	// Exported
	Command          interface{}
	DirConfiguration DirectoryConfiguration
	PageBasedRouter  []PageBasedRoute
}

// ExperimentalReactSuspenseEnabled   bool // Wrap <React.Suspense>
// ExperimentalReactStrictModeEnabled bool // Wrap <React.StrictMode>
