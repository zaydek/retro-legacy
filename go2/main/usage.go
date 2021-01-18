package main

import (
	"fmt"

	"github.com/zaydek/retro/color"
)

var usage = `
  ` + color.Bold("Usage:") + `

    retro version            Prints the current and available versions of Retro
    retro init               Initializes Retro in the current directory
    retro watch              Starts a rapid-development server and watches for changes
    retro build              Builds a production-ready build
    retro serve              Serves the production-ready build

  ` + color.Bold("Examples:") + `

    # init
    retro init               Initializes Retro in the current directory
    retro init retro-app     Initializes Retro at retro-app

    # watch
    retro                    Starts the dev server
    retro watch              Starts the dev server
    retro watch public       Starts the dev server and watches public
    retro watch --port=8080  Starts the dev server on port 8080
    PORT=8080 retro watch    Starts the dev server on port 8080

    # build
    retro build              Builds a production-ready build

    # serve
    retro serve              Serves the production-ready build
`

func (r Retro) help() {
	// (Do not use stdout)
	fmt.Println(usage)
}

func (r Retro) unknown(cmd string) {
	stderr.Printf("no such command %q; try retro help\n", cmd)
}
