package main

import (
	"fmt"
	"os"
	"time"
)

// config, err := config.LoadOrCreateConfiguration()
// if err != nil {
// 	panic(err)
// }
// fmt.Printf("%+v\n", config)

func main() {
	t := time.Now()

	var retro Retro

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
	// TODO: Add support for more paths than pages.
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
		retro.serve()

	default:
		retro.unknown(os.Args[1])
		os.Exit(1)
	}

	fmt.Printf("⚡️ %0.3fs\n", time.Since(t).Seconds())
}
