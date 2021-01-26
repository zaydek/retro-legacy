package main

import (
	"os"
	"time"

	"github.com/evanw/esbuild/pkg/api"
	"github.com/zaydek/retro/color"
)

type RetroApp struct {
	esbuildResult   api.BuildResult
	esbuildWarnings []api.Message
	esbuildErrors   []api.Message

	Configuration   Configuration
	PageBasedRouter []PageBasedRoute
}

// var usage = `
//   ` + color.Bold("Usage:") + `
//
//     retro version            Prints the current and available versions of Retro
//     retro init [dir]         Creates a Retro app at [dir]
//     retro watch              Starts a rapid-development server and watches for changes
//     retro build              Builds a production-ready build
//     retro serve              Serves the production-ready build
//
//   ` + color.Bold("Examples:") + `
//
//     # init
//     retro init .             Creates a Retro app at .
//     retro init retro-app     Creates a Retro app at retro-app
//
//     # watch
//     retro watch              Starts the dev server
//     retro watch --port=8080  Starts the dev server on port 8080
//     PORT=8080 retro watch    Starts the dev server on port 8080
//
//     # build
//     retro build              Builds a production-ready build
//
//     # serve
//     retro serve              Serves the production-ready build
//
//   ` + color.Bold("Documentation:") + `
//     ` + color.Underline("TODO") + `
//
//   ` + color.Bold("Repository:") + `
//     ` + color.Underline("https://github.com/zaydek/retro") + `
// `

var usage = `
  ` + color.Bold("Usage:") + `

    retro init [dir]  Creates a new Retro app at directory [dir]
    retro watch       Starts the development server and watches for changes
    retro build       Build the production-ready build
    retro serve       Serves the production-ready build

  ` + color.Bold("Repository:") + `

    ` + color.Underline("https://github.com/zaydek/retro") + `
`

func (app *RetroApp) usage() {
	raw.Println(usage)
}

func (app *RetroApp) version() {
	stdout.Println("0.0.x")
}

func (app *RetroApp) unknown(cmd string) {
	stderr.Printf("Unrecognized command 'retro %s'. "+
		"Try 'retro usage'.\n", cmd)
	os.Exit(1)
}

func main() {
	var (
		now = time.Now()
		app = &RetroApp{} // TODO: We should have an initializer for this
	)

	defer color.TerminateFormatting(os.Stdout)

	// $ retro help
	if len(os.Args) < 2 {
		app.usage()
		return
	}

	switch os.Args[1] {

	// $ retro usage
	case "usage":
		fallthrough
	case "--usage":
		app.usage()
		return // Eager return

	// $ retro help
	case "help":
		fallthrough
	case "--help":
		app.usage()

	// $ retro version
	case "version":
		fallthrough
	case "--version":
		fallthrough
	case "-v":
		app.version()

	// $ retro init
	case "init":
		var dirname string
		if len(os.Args) < 3 {
			stderr.Println("It looks like you’re trying to run 'retro init' in the current directory. " +
				"In that case, use '.' explicitly:\n\n" +
				"- retro init .\n\n" +
				"Or\n\n" +
				"- retro init retro-app")
			os.Exit(1)
		}
		dirname = os.Args[2]
		app.init(dirname)

	// $ retro watch
	//
	// TODO: Add support for env PORT and argument --port.
	// TODO: Add support for more paths than pages. Actually, it would be nicer if
	// RetroApp restarts the watcher when config.PublicDur or config.PagesDir
	// changes. In theory we should also restart if there are changes to
	// app.config.jsonc.
	case "watch":
		app.watch()

	// $ retro build
	case "build":
		app.build()

	// $ retro serve
	case "serve":
		app.serve()

	default:
		app.unknown(os.Args[1])
		// (NOTE: unknown uses os.Exit(1))
	}

	raw.Printf("⚡️ %0.3fs\n", time.Since(now).Seconds())
}
