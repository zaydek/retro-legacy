package dev

import (
	_ "embed"
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	loggers.Stderr.Fatalln(err)
}

func Run() {
	start := time.Now()
	defer term.Revert(os.Stdout)

	runtime := newRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case "start":
		runtime.Start()
	case "build":
		runtime.Build()
	case "serve":
		runtime.Serve()
	}
	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}
