package dev

import (
	_ "embed"
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/pkg/term"
)

func Run() {
	start := time.Now()
	defer term.Revert(os.Stdout)

	runtime := newRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case "watch":
		runtime.Watch()
	case "build":
		runtime.Build()
	case "serve":
		runtime.Serve()
	}
	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}
