package cli

import (
	"strings"

	"github.com/zaydek/retro/term"
)

var usageOnly = strings.TrimSpace(`
retro create [dir]      Creates a new Retro app at directory dir
retro watch [...paths]  Starts the dev server and watches paths for changes
retro build             Builds the production-ready build
retro serve             Serves the production-ready build
`)

var manpage = `
  ` + term.BoldWhite("Usage:") + `

    retro create [dir]      Creates a new Retro app at directory dir
    retro watch [...paths]  Starts the dev server and watches paths for changes
    retro build             Builds the production-ready build
    retro serve             Serves the production-ready build

  ` + term.BoldWhite("retro create [dir]") + `

    Creates a new Retro app at directory dir

      --template=[js|ts]    Starter template (default js)

  ` + term.BoldWhite("retro watch [...dirs]") + `

    Starts a dev server and watches directories dirs for changes (default pages)

      --cached              Reuse cached props (disabled by default)
      --poll=<duration>     Poll duration (default 250ms)
      --port=<number>       Port number (default 8000)
      --source-map          Add source maps (disabled by default)

  ` + term.BoldWhite("retro build") + `

    Builds the production-ready build

      --cached              Reuse cached props (disabled by default)
      --source-map          Add source maps (disabled by default)

  ` + term.BoldWhite("retro serve") + `

    Serves the production-ready build

      --port=<number>       Port number (default 8000)

  ` + term.BoldWhite("Repository:") + `

    ` + term.Underline("https://github.com/zaydek/retro") + `
`
