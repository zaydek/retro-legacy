package cli

import (
	"strings"

	"github.com/zaydek/retro/pkg/term"
)

// TODO: Flags should be order-independent.
var usageOnly = strings.TrimSpace(`
retro dev     Starts the dev server
retro export  Exports the production-ready build (SSG)
retro serve   Serves the production-ready build
`)

var usage = term.Bold("Usage:") + `

  retro dev          Starts the dev server
  retro export       Exports the production-ready build (SSG)
  retro serve        Serves the production-ready build

` + term.Bold("retro dev") + `

  Starts the dev server

    --cached         Use cached resources (default false)
    --source-map     Add source maps (default true)
    --port=<number>  Port number (default 8000)

` + term.Bold("retro export") + `

  Exports the production-ready build (SSG)

    --cached         Use cached resources (default false)
    --source-map     Add source maps (default true)

` + term.Bold("retro serve") + `

  Serves the production-ready build

    --port=<number>  Port number (default 8000)

` + term.Bold("Repository:") + `

  ` + term.Underline("https://github.com/zaydek/retro") + "\n"
