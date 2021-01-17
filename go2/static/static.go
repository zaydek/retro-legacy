package static

import (
	"embed"
	"io/fs"
)

// NOTE: Must use starter/* not starter because of hidden files.
//
// https://github.com/golang/go/issues/42328
// https://go-review.googlesource.com/c/go/+/275092
//
//go:embed starter/*
var starterFS embed.FS

var StaticFS, _ = fs.Sub(starterFS, "starter")

// func init() {
// 	var err error
// 	StaticFS, err = fs.Sub(staticFSImpl, "starter")
// 	if err != nil {
// 		panic(err)
// 	}
// }
//
// // Sub(dir string) (FS, error)
//
