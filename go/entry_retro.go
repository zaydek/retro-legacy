package main

import (
	_ "embed"
	"os"
	"strings"

	"github.com/zaydek/retro/cmd/retro"
)

func init() {
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))
}

//go:generate ../node_modules/.bin/esbuild scripts/export.ts --format=cjs --outfile=scripts/export.esbuild.js --sourcemap
//go:generate ../node_modules/.bin/esbuild dev.ts --format=cjs --outfile=dev.esbuild.js --sourcemap
func main() {
	retro.Run()
}
