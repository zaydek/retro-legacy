package main

import (
	_ "embed"
	"os"
	"strings"

	"github.com/zaydek/retro/cmd/create_retro_app"
)

func init() {
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))
}

func main() {
	create_retro_app.Run()
}
