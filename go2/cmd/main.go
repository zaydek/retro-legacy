package main

import (
	"os"

	"github.com/zaydek/retro/color"
)

func main() {
	defer color.TerminateFormatting(os.Stdout)

	// start := time.Now()
	// defer func() { fmt.Println("⚡️ %0.3fs\n", time.Since(start).Seconds()) }()

	// runtime := loadRuntime()
	loadRuntime()
}
