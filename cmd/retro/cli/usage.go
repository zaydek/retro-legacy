package cli

import (
	"strings"

	"github.com/zaydek/retro/pkg/term"
)

var usageOnly = strings.TrimSpace(`
retro start  Starts the dev server
retro build  Builds the production-ready build
retro serve  Serves the production-ready build
`)

var usage = `
  ` + term.Bold("Usage:") + `

    retro start        Starts the dev server
    retro build        Builds the production-ready build
    retro serve        Serves the production-ready build

  ` + term.Bold("retro start") + `

    Starts the dev server

      --cached         Use cached resources (default false)
      --port=<number>  Port number (default 8000)
      --source-map     Add source maps (default false)

  ` + term.Bold("retro build") + `

    Builds the production-ready build

      --cached         Use cached resources (default false)
      --source-map     Add source maps (default false)

  ` + term.Bold("retro serve") + `

    Serves the production-ready build

      --port=<number>  Port number (default 8000)

  ` + term.Bold("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/retro") + `
`
