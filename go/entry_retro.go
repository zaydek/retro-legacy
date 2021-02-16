package main

import (
	_ "embed"
	"os"
	"strings"

	"github.com/zaydek/retro/cmd/retro"
)

func init() {
	// TODO: This is a little over-engineered. Right now we are reading
	// RETRO_VERSION from an embedded file (version.txt) and setting as an
	// environmental variable. If we can simply set RETRO_VERSION as a global
	// variable, this obviates the need for this complexity.
	//
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))
}

func main() {
	retro.Run()
}
