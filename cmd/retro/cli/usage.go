package cli

import (
	"github.com/zaydek/retro/pkg/terminal"
)

var (
	bold      = terminal.Bold.Sprint
	cyan      = terminal.Cyan.Sprint
	underline = terminal.Underline.Sprint
)

var usage = `
` + bold("retro dev") + `

	Start the dev server

		--cached=...        Reuse cached resources (default 'false')
		--fast-refresh=...  Use fast refresh (default 'true')
		--port=...          Use port (default '8000')
		--sourcemap=...     Add source maps (default 'true')

` + bold("retro export") + `

	Export the production-ready build

		--cached=...        Reuse cached resources (default 'false')
		--sourcemap=...     Add source maps (default 'true')

` + bold("retro serve") + `

	Serve the production-ready build

		--port=...          Use port (default '8000')

` + bold("Examples") + `

	` + cyan("%") + ` retro dev
	` + cyan("%") + ` retro dev --port=3000
	` + cyan("%") + ` retro export
	` + cyan("%") + ` retro export --cached && retro serve
	` + cyan("%") + ` retro export && retro serve

` + bold("Repository") + `

	` + underline("https://github.com/zaydek/retro") + `
	` + underline("https://github.com/evanw/esbuild") + `
`
