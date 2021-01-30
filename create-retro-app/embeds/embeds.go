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
	JavaScriptFS, _ = fs.Sub(jsFS, "javascript")
	TypeScriptFS, _ = fs.Sub(tsFS, "typescript")
)
