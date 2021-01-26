package embedded

import (
	"embed"
	"io/fs"
)

//go:embed language_javascript/*
var languageJavaScript embed.FS

//go:embed language_typescript/*
var languageTypeScript embed.FS

var (
	// JavaScriptFS mounts the JavaScript template as an embedded filesystem.
	JavaScriptFS, _ = fs.Sub(languageJavaScript, "language_javascript/*")

	// TypeScriptFS mounts the TypeScript template as an embedded filesystem.
	TypeScriptFS, _ = fs.Sub(languageTypeScript, "language_typescript/*")
)
