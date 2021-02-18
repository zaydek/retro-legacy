package main

import (
	_ "embed"
	"os"
	"strings"

	create_retro_app "github.com/zaydek/retro/cmd/create-retro-app"
)

func init() {
	//go:embed version.txt
	var v string
	os.Setenv("RETRO_VERSION", strings.TrimSpace(v))
}

func main() {
	create_retro_app.Run()
}
