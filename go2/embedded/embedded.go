package embedded

import (
	"embed"
	"io/fs"
)

//go:embed template/*
var templateFS embed.FS

var FS, _ = fs.Sub(templateFS, "template")
