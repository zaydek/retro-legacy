package main

import (
	_ "embed"
	"os"
	"strings"

	"github.com/zaydek/retro/cmd/dev"
)

func main() {
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))

	dev.Run()
}
