package main

import (
	_ "embed"

	"github.com/zaydek/retro/cmd/create"
	"github.com/zaydek/retro/pkg/env"
)

func main() {
	//go:embed version.txt
	var text string
	env.SetEnvVars(text)

	create.Run()
}
