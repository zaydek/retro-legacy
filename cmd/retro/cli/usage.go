package cli

import (
	"strings"

	"github.com/zaydek/retro/pkg/terminal"
)

var cmds = strings.TrimSpace(`
retro dev     Starts the dev server
retro export  Exports the production-ready build (SSG)
retro serve   Serves the production-ready build
`)

var usage = `
` + terminal.Bold("retro dev") + `

  Start the dev server

    --cached            Use cached resources (default ` + terminal.Teal("false") + `)
		--fast-refresh=...  Use fast refresh (default ` + terminal.Teal("true") + `)
		--port=...          Use port number (default ` + terminal.Teal("8000") + `)
		--sourcemap=...     Add source maps (default ` + terminal.Teal("true") + `)

` + terminal.Bold("retro export") + `

  Export the production-ready build

    --cached            Use cached resources (default ` + terminal.Teal("false") + `)
    --sourcemap         Add source maps (default ` + terminal.Teal("true") + `)

` + terminal.Bold("retro serve") + `

  Serve the production-ready build

    --port=<number>     Port number (default ` + terminal.Teal("8000") + `)

` + terminal.Bold("Examples") + `

	` + terminal.Teal("%") + ` retro dev
	` + terminal.Teal("%") + ` retro dev --port=3000
	` + terminal.Teal("%") + ` retro export
	` + terminal.Teal("%") + ` retro export --cached && retro serve
	` + terminal.Teal("%") + ` retro export && retro serve

` + terminal.Bold("Repository") + `

  ` + terminal.Underline("https://github.com/zaydek/retro") + `
  ` + terminal.Underline("https://github.com/evanw/esbuild") + "\n"
