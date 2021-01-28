package embeds

import (
	"embed"
	"io/fs"
)

//go:embed javascript/*
var jsFS embed.FS

//go:embed typescript/*
var tsFS embed.FS

var (
	// JavaScriptFS mounts the JavaScript template as an embedded filesystem.
	JavaScriptFS, _ = fs.Sub(jsFS, "javascript")

	// TypeScriptFS mounts the TypeScript template as an embedded filesystem.
	TypeScriptFS, _ = fs.Sub(tsFS, "typescript")
)
