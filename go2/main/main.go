package main

import (
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/color"
)

// config, err := config.LoadOrCreateConfiguration()
// if err != nil {
// 	panic(err)
// }
// fmt.Printf("%+v\n", config)

var retro Retro

func main() {
	defer color.TerminateFormatting()
	t := time.Now()

	// $ retro
	if len(os.Args) < 2 {
		retro.watch()
		return
	}

	switch os.Args[1] {
	// $ retro help
	case "usage":
		fallthrough
	case "--usage":
		fallthrough
	case "help":
		fallthrough
	case "--help":
		retro.help()

	// $ retro version
	case "version":
		fallthrough
	case "--version":
		retro.version()

	// $ retro init
	//
	// TODO: Add support for $ retro init --no-comment.
	case "init":
		fallthrough
	case "--init":
		rootDir := "."
		if len(os.Args) > 2 {
			rootDir = os.Args[2]
		}
		retro.init(rootDir)

	// $ retro watch
	//
	// TODO: Add support for env PORT and argument --port.
	// TODO: Add support for more paths than pages. Actually, it would be nicer if
	// Retro restarts the watcher when config.PublicDur or config.PagesDir
	// changes. In theory we should also restart if there are changes to
	// retro.config.jsonc.
	case "watch":
	case "--watch":
		retro.watch()

	// $ retro build
	//
	case "build":
	case "--build":
		retro.build()

	// $ retro serve
	//
	// TODO: Add support for env PORT and argument --port.
	case "serve":
		fallthrough
	case "--serve":
		// TODO: Add error for no such build directory x; run retro build && retro serve
		retro.serve()

	default:
		retro.unknown(os.Args[1])
		os.Exit(1)
	}

	fmt.Printf("⚡️ %0.3fs\n", time.Since(t).Seconds())
}
