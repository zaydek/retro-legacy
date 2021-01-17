package main

import (
	"os"
)

// config, err := config.LoadOrCreateConfiguration()
// if err != nil {
// 	panic(err)
// }
// fmt.Printf("%+v\n", config)

func main() {
	retro := newRetro(os.Stdin, os.Stderr)

	// $ retro
	if len(os.Args) < 2 {
		retro.watch()
		return
	}

	switch os.Args[1] {
	// $ retro help
	case "help":
		fallthrough
	case "--help":
		retro.help()

	// $ retro init
	//
	// TODO: Add support for:
	//
	// $ retro init --no-comment
	// $ retro init .
	// $ retro init retro-app
	//
	case "init":
		fallthrough
	case "--init":
		root := "."
		if len(os.Args) < 3 {
			root = os.Args[2]
		}
		retro.init(root)

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
}
