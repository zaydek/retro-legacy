package cli

import "github.com/zaydek/retro/pkg/terminal"

var usage = terminal.Bold("retro dev") + `

	Start the dev server

		--cached=...        Reuse cached resources (default 'false')
		--fast-refresh=...  Use fast refresh (default 'true')
		--port=...          Use port (default '8000')
		--sourcemap=...     Add source maps (default 'true')

` + terminal.Bold("retro export") + `

	Export the production-ready build

		--cached=...        Reuse cached resources (default 'false')
		--sourcemap=...     Add source maps (default 'true')

` + terminal.Bold("retro serve") + `

	Serve the production-ready build

		--port=...          Use port (default '8000')

` + terminal.Bold("Examples") + `

	` + terminal.Cyan("%") + ` retro dev
	` + terminal.Cyan("%") + ` retro dev --port=3000
	` + terminal.Cyan("%") + ` retro export
	` + terminal.Cyan("%") + ` retro export --cached && retro serve
	` + terminal.Cyan("%") + ` retro export && retro serve

` + terminal.Bold("Repository") + `

	` + terminal.Underline("https://github.com/zaydek/retro") + `
	` + terminal.Underline("https://github.com/evanw/esbuild") + `
`
