import * as log from "../lib/log"
import * as term from "../lib/term"
import * as types from "./types"

interface CLI {
	parseDevCommand(): types.DevCommand
	parseExportCommand(): types.ExportCommand
	parseServeCommand(): types.ServeCommand
}

// newCLI creates a new CLI that parses commands.
export default function newCLI(...args: string[]): CLI {
	return {
		// parseDevCommand parses the dev command; 'retro dev ...'.
		parseDevCommand(): types.DevCommand {
			const command: types.DevCommand = {
				type: "dev",
				cached: false,
				sourcemap: true,
				port: 8000,
			}
			let badCommand = ""
			for (const arg of args) {
				if (arg.startsWith("--cached")) {
					if (arg === "--cached") {
						command.cached = true
					} else if (arg === "--cached=true" || arg === "--cached=false") {
						command.cached = JSON.parse(arg.slice("--cached=".length))
					} else {
						badCommand = "--cached"
						break
					}
				} else if (arg.startsWith("--sourcemap")) {
					if (arg === "--sourcemap") {
						command.sourcemap = true
					} else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
						command.sourcemap = JSON.parse(arg.slice("--sourcemap=".length))
					} else {
						badCommand = "--sourcemap"
						break
					}
				} else if (arg.startsWith("--port")) {
					if (/^--port=\d+$/.test(arg)) {
						command.port = JSON.parse(arg.slice("--port=".length))
					} else {
						badCommand = "--port"
						break
					}
				} else {
					badCommand = arg
				}
			}
			if (badCommand !== "") {
				log.error(`Bad command ${term.magenta(`'${badCommand}'`)}. Use ${term.magenta("'retro help'")} for help.`)
			}
			if (command.port < 1e3 || command.port >= 1e4) {
				log.error(`${term.magenta("'--port'")} must be between 1000-9999.`)
			}
			return command
		},

		// parseExportCommand parses the export command; 'retro export ...'.
		parseExportCommand(): types.ExportCommand {
			const command: types.ExportCommand = {
				type: "export",
				cached: false,
				sourcemap: true,
			}
			let badCommand = ""
			for (const arg of args) {
				if (arg.startsWith("--cached")) {
					if (arg === "--cached") {
						command.cached = true
					} else if (arg === "--cached=true" || arg === "--cached=false") {
						command.cached = JSON.parse(arg.slice("--cached=".length))
					} else {
						badCommand = "--cached"
						break
					}
				} else if (arg.startsWith("--sourcemap")) {
					if (arg === "--sourcemap") {
						command.sourcemap = true
					} else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
						command.sourcemap = JSON.parse(arg.slice("--sourcemap=".length))
					} else {
						badCommand = "--sourcemap"
						break
					}
				} else {
					badCommand = arg
				}
			}
			if (badCommand !== "") {
				log.error(`Bad command ${term.magenta(`'${badCommand}'`)}. Use ${term.magenta("'retro help'")} for help.`)
			}
			return command
		},

		// parseServeCommand parses the serve command; 'retro serve ...'.
		parseServeCommand(): types.ServeCommand {
			const command: types.ServeCommand = {
				type: "serve",
				mode: "ssg",
				port: 8000,
			}
			let badCommand = ""
			for (const arg of args) {
				if (arg.startsWith("--mode")) {
					if (arg === "--mode=spa") {
						command.mode = "spa"
					} else if (arg === "--mode=ssg") {
						command.mode = "ssg"
					} else {
						badCommand = "--mode"
						break
					}
				} else if (arg.startsWith("--port")) {
					if (/^--port=\d+$/.test(arg)) {
						command.port = JSON.parse(arg.slice("--port=".length))
					} else {
						badCommand = "--port"
						break
					}
				} else {
					badCommand = arg
				}
			}
			if (badCommand !== "") {
				log.error(`Bad command ${term.magenta(`'${badCommand}'`)}. Use ${term.magenta("'retro help'")} for help.`)
			}
			if (command.port < 1e3 || command.port >= 1e4) {
				log.error(`${term.magenta("'--port'")} must be between 1000-9999.`)
			}
			return command
		},
	}
}
