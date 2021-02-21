import * as log from "../lib/log"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

import serve from "./serve"

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

// parseDevCommandArgs parses 'retro dev [flags]'.
// TODO: Write tests.
function parseDevCommandArgs(...args: string[]): types.DevCommand {
	const cmd: types.DevCommand = {
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

// parseExportCommandArgs parses 'retro export [flags]'.
// TODO: Write tests.
function parseExportCommandArgs(...args: string[]): types.ExportCommand {
	const cmd: types.ExportCommand = {
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

// parseServeCommandArgs parses 'retro serve [flags]'.
// TODO: Write tests.
function parseServeCommandArgs(...args: string[]): types.ServeCommand {
	const cmd: types.ServeCommand = {
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

// prettier-ignore
const DIRS = {
	publicDir:   process.env.PUBLIC_DIR || "public",
	srcPagesDir: process.env.PAGES_DIR  || "src/pages",
	cacheDir:    process.env.CACHE_DIR  || "__cache__",
	exportDir:   process.env.EXPORT_DIR || "__export__",
}

async function run(): Promise<void> {
	const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv

	// Cover ["retro"] case:
	if (args.length === 1) {
		console.log(usage)
		process.exit(0)
	}

	let cmd: types.Command
	const arg = args[1]
	if (arg === "version" || arg === "--version" || arg === "--v") {
		console.log(process.env["RETRO_VERSION"] || "TODO")
		process.exit(0)
	} else if (arg === "usage" || arg === "--usage" || arg === "help" || arg === "--help") {
		console.log(usage)
		process.exit(0)
	} else if (arg === "dev") {
		process.env["__DEV__"] = "true"
		process.env["NODE_ENV"] = "development"
		cmd = parseDevCommandArgs(...args.slice(2))
	} else if (arg === "export") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		cmd = parseExportCommandArgs(...args.slice(2))
	} else if (arg === "serve") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		cmd = parseServeCommandArgs(...args.slice(2))
	} else {
		// TODO: log.error should automatically space-indent so we don’t have to at
		// every call site.
		// prettier-ignore
		log.error(new Error(`No such command '${arg}'. Use one of these commands:

${cmds.split("\n").map(each => `${" ".repeat(2)}- ${each}`).join("\n")}

  Or use 'retro usage' for usage.`))
	}

	const runtime: types.Runtime<types.Command> = {
		cmd: cmd!,
		dirs: DIRS,
	}

	switch (cmd!.type) {
		case "dev":
			// await serve(runtime as types.Runtime<types.DevCommand>)
			break
		case "export":
			// await serve(runtime as types.Runtime<types.ExportCommand>)
			break
		case "serve":
			await serve(runtime as types.Runtime<types.ServeCommand>)
			break
	}
}

process.on("uncaughtException", err => {
	utils.setWillEagerlyTerminate(true)

	// console.log({ err })

	// Force the stack trace on:
	process.env["STACK_TRACE"] = "true"
	err.message = `UncaughtException: ${err.message}.`
	log.error(err)
})

run()
