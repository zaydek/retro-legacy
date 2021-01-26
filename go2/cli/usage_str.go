package cli

import "github.com/zaydek/retro/color"

var usageStr = `
	` + color.BoldWhite("Usage:") + `

		retro create [dir]      ` + color.Underline("Creates") + ` a new Retro app at directory 'dir'
		retro watch [...dirs]   Starts the development server and ` + color.Underline("watches") + ` 'dirs' for changes
		retro build             ` + color.Underline("Builds") + ` the production-ready build
		retro serve             ` + color.Underline("Serves") + ` the production-ready build

	` + color.BoldWhite("retro create [dir]") + `

		'retro create' creates a new Retro app at directory 'dir'

			--language=[js | ts]  Programming language (default 'js')

	` + color.BoldWhite("retro watch [...dirs]") + `

		'retro watch' starts a development server and watches directories 'dirs' for
		changes (default 'components pages')

			--poll=<duration>     Poll duration (default '250ms')
			--port=<number>       Port number (default '8000')

	` + color.BoldWhite("retro build") + `

		'retro build' builds the production-ready build

			--cached              Use cached props for faster builds (disabled by default)

	` + color.BoldWhite("retro serve") + `

		'retro serve' serves the production-ready build

			--port=<number>       Port number (default '8000')

	` + color.BoldWhite("Repository:") + `

		` + color.Underline("https://github.com/zaydek/retro") + `
`
