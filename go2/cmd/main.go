package main

import (
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/color"
)

func main() {
	defer color.TerminateFormatting(os.Stdout)

	start := time.Now()

	runtime := loadRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case "create":
		runtime.Create()
	case "watch":
		must(serverGuards(runtime.Config))
		runtime.Watch()
	case "build":
		must(serverGuards(runtime.Config))
		runtime.Build()
	case "serve":
		runtime.Serve()
	}

	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}
