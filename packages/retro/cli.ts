import * as log from "../lib/log"
import * as term from "../lib/term"
import * as types from "./types"

import { serve } from "./serve"

export const cmds = `
retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build
`.trim()

export const usage =
	`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold("Usage:")}

    retro dev     Start the dev server
    retro export  Export the production-ready build (SSG)
    retro serve   Serve the production-ready build

  ${term.bold("retro dev")}

    Start the dev server

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)
      --port=<number>=...  Port number (default 8000)

  ${term.bold("retro export")}

    Export the production-ready build (SSG)

      --cached=...         Use cached resources (default false)
      --source-map=...     Add source maps (default true)

  ${term.bold("retro serve")}

    Serve the production-ready build

      --port=...           Port number (default 8000)

  ${term.bold("Repository:")}

    ` +
	term.underline("https://github.com/zaydek/retro") +
	`
`

// parseCmdDevArguments parses 'retro dev [flags]'.
// TODO: Write tests.
function parseCmdDevArguments(...args: string[]): types.CmdDev {
	const cmd: types.CmdDev = {
		type: "dev",
		cached: false,
		sourcemap: true,
		port: 8000,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--cached")) {
			if (arg === "--cached") {
				cmd.cached = true
			} else if (arg === "--cached=true" || arg === "--cached=false") {
				cmd.cached = JSON.parse(arg.slice("--cached=".length))
			} else {
				badCmd = "--cached"
				break
			}
		} else if (arg.startsWith("--sourcemap")) {
			if (arg === "--sourcemap") {
				cmd.sourcemap = true
			} else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
				cmd.sourcemap = JSON.parse(arg.slice("--sourcemap=".length))
			} else {
				badCmd = "--sourcemap"
				break
			}
		} else if (arg.startsWith("--port")) {
			if (/^--port=\d+$/.test(arg)) {
				cmd.port = JSON.parse(arg.slice("--port=".length))
			} else {
				badCmd = "--port"
				break
			}
		} else {
			badCmd = arg
		}
	}
	if (badCmd !== "") {
		log.error(`Bad command '${badCmd}'. You can use 'retro help' for help.`)
	}
	if (cmd.port < 1e3 || cmd.port >= 1e4) {
		log.error("'--port' must be between 1000-9999.")
	}
	return cmd
}

// parseCmdDevArguments parses 'retro export [flags]'.
// TODO: Write tests.
function parseCmdExportArguments(...args: string[]): types.CmdExport {
	const cmd: types.CmdExport = {
		type: "export",
		cached: false,
		sourcemap: true,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--cached")) {
			if (arg === "--cached") {
				cmd.cached = true
			} else if (arg === "--cached=true" || arg === "--cached=false") {
				cmd.cached = JSON.parse(arg.slice("--cached=".length))
			} else {
				badCmd = "--cached"
				break
			}
		} else if (arg.startsWith("--sourcemap")) {
			if (arg === "--sourcemap") {
				cmd.sourcemap = true
			} else if (arg === "--sourcemap=true" || arg === "--sourcemap=false") {
				cmd.sourcemap = JSON.parse(arg.slice("--sourcemap=".length))
			} else {
				badCmd = "--sourcemap"
				break
			}
		} else {
			badCmd = arg
		}
	}
	if (badCmd !== "") {
		log.error(`Bad command '${badCmd}'. You can use 'retro help' for help.`)
	}
	return cmd
}

// parseCmdDevArguments parses 'retro serve [flags]'.
// TODO: Write tests.
function parseCmdServeArguments(...args: string[]): types.CmdServe {
	const cmd: types.CmdServe = {
		type: "serve",
		port: 8000,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--port")) {
			if (/^--port=\d+$/.test(arg)) {
				cmd.port = JSON.parse(arg.slice("--port=".length))
			} else {
				badCmd = "--port"
				break
			}
		} else {
			badCmd = arg
		}
	}
	if (badCmd !== "") {
		log.error(`Bad command '${badCmd}'. You can use 'retro help' for help.`)
	}
	if (cmd.port < 1e3 || cmd.port >= 1e4) {
		log.error("'--port' must be between 1000-9999.")
	}
	return cmd
}

function run(): void {
	const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv

	// Cover ["retro"] case:
	if (args.length === 1) {
		console.log(usage)
		process.exit(0)
	}

	let cmd: types.Cmd
	const arg = args[1]
	if (arg === "version" || arg === "--version" || arg === "--v") {
		console.log(process.env["RETRO_VERSION"] || "TODO")
		process.exit(0)
	} else if (arg === "usage" || arg === "--usage" || arg === "help" || arg === "--help") {
		console.log(usage)
		process.exit(0)
	} else if (arg === "dev") {
		cmd = parseCmdDevArguments(...args.slice(2))
	} else if (arg === "export") {
		cmd = parseCmdExportArguments(...args.slice(2))
	} else if (arg === "serve") {
		cmd = parseCmdServeArguments(...args.slice(2))
	} else {
		// prettier-ignore
		log.error(`Unrecognized command. Here are the commands you can use:

${cmds.split("\n").map(each => " ".repeat(2) + each).join("\n")}`)
	}

	switch (cmd!.type) {
		case "dev":
			process.env["__DEV__"] = "true"
			process.env["NODE_ENV"] = "development"
			// dev(cmd! as types.CmdDev)
			break
		case "export":
			process.env["__DEV__"] = "false"
			process.env["NODE_ENV"] = "production"
			// export_(cmd! as types.CmdExport)
			break
		case "serve":
			process.env["__DEV__"] = "false"
			process.env["NODE_ENV"] = "production"
			serve(cmd! as types.CmdServe)
			break
	}
}

run()
