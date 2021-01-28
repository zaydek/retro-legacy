package cli

import (
	"strings"

	"github.com/zaydek/retro/color"
)

var usageOnly = strings.TrimSpace(`
retro create [dir]      Creates a new Retro app at directory dir
retro watch [...paths]  Starts the dev server and watches paths for changes
retro build             Builds the production-ready build
retro serve             Serves the production-ready build
`)

var manpages = `
  ` + color.BoldWhite("Usage:") + `

    retro create [dir]      Creates a new Retro app at directory dir
    retro watch [...paths]  Starts the dev server and watches paths for changes
    retro build             Builds the production-ready build
    retro serve             Serves the production-ready build

  ` + color.BoldWhite("retro create [dir]") + `

    Creates a new Retro app at directory dir

      --language=[js|ts]    Programming language (default js)

  ` + color.BoldWhite("retro watch [...dirs]") + `

    Starts a dev server and watches directories dirs for changes (default pages)

      --cached              Reuse cached props (disabled by default)
      --poll=<duration>     Poll duration (default 250ms)
      --port=<number>       Port number (default 8000)
      --source-map          Add source maps (disabled by default)

  ` + color.BoldWhite("retro build") + `

    Builds the production-ready build

      --cached              Reuse cached props (disabled by default)
      --source-map          Add source maps (disabled by default)

  ` + color.BoldWhite("retro serve") + `

    Serves the production-ready build

      --port=<number>       Port number (default 8000)

  ` + color.BoldWhite("Repository:") + `

    ` + color.Underline("https://github.com/zaydek/retro") + `
`
