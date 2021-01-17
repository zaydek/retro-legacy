package static

import (
	"embed"
	"io/fs"
)

// NOTE: Must use template/* not template because of hidden files.
//
// https://github.com/golang/go/issues/42328
// https://go-review.googlesource.com/c/go/+/275092
//
//go:embed template/*
var templateFS embed.FS
var StaticFS, _ = fs.Sub(templateFS, "template")
