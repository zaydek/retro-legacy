package main

import (
	"os"
	"time"

	"github.com/zaydek/retro/color"
)

type Retro struct {
	config Configuration
	router PageBasedRouter
}

var retro Retro

var usage = `
  ` + color.Bold("Usage:") + `

    retro version            Prints the current and available versions of Retro
    retro init [dir]         Creates a Retro app at [dir]
    retro watch              Starts a rapid-development server and watches for changes
    retro build              Builds a production-ready build
    retro serve              Serves the production-ready build

  ` + color.Bold("Examples:") + `

    # init
    retro init .             Creates a Retro app at .
    retro init retro-app     Creates a Retro app at retro-app

    # watch
    retro watch              Starts the dev server
    retro watch --port=8080  Starts the dev server on port 8080
    PORT=8080 retro watch    Starts the dev server on port 8080

    # build
    retro build              Builds a production-ready build

    # serve
    retro serve              Serves the production-ready build

  ` + color.Bold("Documentation:") + `
    ` + color.Underline("TODO") + `

  ` + color.Bold("Repository:") + `
    ` + color.Underline("https://github.com/zaydek/retro") + `
`

func (r Retro) help() {
	raw.Println(usage)
}

func (r Retro) version() {
	stdout.Println("0.0.x")
}

func (r Retro) unknown(cmd string) {
	stderr.Println("unknown command; try retro help")
}

func main() {
	defer color.TerminateFormatting(os.Stdout)
	t := time.Now()

	if len(os.Args) < 2 {
		retro.help()
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
		return // Eager return

	// $ retro version
	case "version":
		fallthrough
	case "--version":
		retro.version()

	// $ retro init
	//
	// TODO: Add support for $ retro init --no-comment.
	case "init":
		var rootDir string
		if len(os.Args) < 3 {
			stderr.Fatalln("try retro init . or retro init retro-app")
		}
		rootDir = os.Args[2]
		retro.init(rootDir)

	// $ retro watch
	//
	// TODO: Add support for env PORT and argument --port.
	// TODO: Add support for more paths than pages. Actually, it would be nicer if
	// Retro restarts the watcher when config.PublicDur or config.PagesDir
	// changes. In theory we should also restart if there are changes to
	// retro.config.jsonc.
	case "watch":
		retro.watch()

	// $ retro build
	//
	case "build":
		retro.build()

	// $ retro serve
	//
	// TODO: Add support for --port.
	case "serve":
		retro.serve()

	default:
		retro.unknown(os.Args[1])
		os.Exit(1)
	}

	raw.Printf("⚡️ %0.3fs\n", time.Since(t).Seconds())
}
