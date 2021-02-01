package main

import (
	_ "embed"
	"os"
	"strings"

	"github.com/zaydek/retro/cmd/create"
)

func main() {
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))

	create.Run()
}
