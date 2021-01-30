package dev

import (
	_ "embed"
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/pkg/env"
	"github.com/zaydek/retro/pkg/term"
)

func Run() {
	//go:embed version.txt
	var text string
	env.SetEnvVars(text)

	defer term.Revert(os.Stdout)

	start := time.Now()

	runtime := loadRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case "watch":
		check(serverGuards(runtime.Config))
		runtime.Watch()
	case "build":
		check(serverGuards(runtime.Config))
		runtime.Build()
	case "serve":
		runtime.Serve()
	}

	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}