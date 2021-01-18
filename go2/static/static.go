package static

import (
	"embed"
	"io/fs"
)

//go:embed template/*
var staticFS embed.FS

var StaticFS, _ = fs.Sub(staticFS, "template")
