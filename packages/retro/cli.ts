import * as log from "../lib/log"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

import cmd_dev from "./cmd_dev"
import cmd_export from "./cmd_export"
import cmd_serve from "./cmd_serve"

const usage = `
\x20${term.bold("Usage:")}

\x20\x20\x20retro dev        Start the dev server
\x20\x20\x20retro export     Export the production-ready build (SSG)
\x20\x20\x20retro serve      Serve the production-ready build

\x20${term.bold("retro dev")}

\x20\x20\x20Start the dev server

\x20\x20\x20--cached=...     Use cached resources (default false)
\x20\x20\x20--sourcemap=...  Add source maps (default true)
\x20\x20\x20--port=...       Port number (default 8000)

\x20${term.bold("retro export")}

\x20\x20\x20Export the production-ready build (SSG)

\x20\x20\x20--cached=...     Use cached resources (default false)
\x20\x20\x20--sourcemap=...  Add source maps (default true)

\x20${term.bold("retro serve")}

\x20\x20\x20Serve the production-ready build

\x20\x20\x20--mode=...       Serve mode 'spa' or 'ssg' (default 'ssg')
\x20\x20\x20--port=...       Port number (default 8000)

\x20${term.bold("Repository")}

\x20\x20\x20${term.underline("https://github.com/zaydek/retro")}
`

const cmds = `
retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build
`.trim()

// parseDevCommandFlags parses 'retro dev [flags]'.
//
// TODO: Write tests.
function parseDevCommandFlags(...args: string[]): types.DevCommand {
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
		log.error(`Bad command ${term.magenta(`'${badCmd}'`)}. You can use ${term.magenta("'retro help'")} for help.`)
	}
	if (cmd.port < 1e3 || cmd.port >= 1e4) {
		log.error(`${term.magenta("'--port'")} must be between 1000-9999.`)
	}
	return cmd
}

// parseExportCommandFlags parses 'retro export [flags]'.
//
// TODO: Write tests.
function parseExportCommandFlags(...args: string[]): types.ExportCommand {
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
		log.error(`Bad command ${term.magenta(`'${badCmd}'`)}. You can use ${term.magenta("'retro help'")} for help.`)
	}
	return cmd
}

// parseServeCommandFlags parses 'retro serve [flags]'.
//
// TODO: Write tests.
function parseServeCommandFlags(...args: string[]): types.ServeCommand {
	const cmd: types.ServeCommand = {
		type: "serve",
		mode: "ssg",
		port: 8000,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--mode")) {
			if (arg === "--mode=spa") {
				cmd.mode = "spa"
			} else if (arg === "--mode=ssg") {
				cmd.mode = "ssg"
			} else {
				badCmd = "--mode"
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
		log.error(`Bad command ${term.magenta(`'${badCmd}'`)}. You can use ${term.magenta("'retro help'")} for help.`)
	}
	if (cmd.port < 1e3 || cmd.port >= 1e4) {
		log.error(`${term.magenta("'--port'")} must be between 1000-9999.`)
	}
	return cmd
}

// // cmd returns the command used.
// function cmd(): string {
// 	const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv
// 	return `retro ${args.slice(1).join(" ")}`
// }

async function run(): Promise<void> {
	const args = process.argv0 === "node" ? process.argv.slice(1) : process.argv

	// Cover ["retro"] case:
	if (args.length === 1) {
		console.log(usage.replace("\t", " ".repeat(2)))
		process.exit(0)
	}

	let command: types.Command
	const arg = args[1]
	if (arg === "version" || arg === "--version" || arg === "--v") {
		console.log(process.env["RETRO_VERSION"] || "TODO")
		process.exit(0)
	} else if (arg === "usage" || arg === "--usage" || arg === "help" || arg === "--help") {
		console.log(usage.replace("\t", " ".repeat(2)))
		process.exit(0)
	} else if (arg === "dev") {
		process.env["__DEV__"] = "true"
		process.env["NODE_ENV"] = "development"
		command = parseDevCommandFlags(...args.slice(2))
	} else if (arg === "export") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		command = parseExportCommandFlags(...args.slice(2))
	} else if (arg === "serve") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		command = parseServeCommandFlags(...args.slice(2))
	} else {
		log.error(`No such command ${term.magenta(`'${arg}'`)}.

Supported commands:

${
	cmds
	// .split("\n")
	// .map(each => "\x20\x20" + each)
	// .join("\n")
}

${term.yellow("hint:")} Use ${term.magenta("'retro usage'")} for usage.`)
	}

	// prettier-ignore
	const runtime: types.Runtime = {
		command: command!,
		directories: {
			publicDir:   process.env.PUBLIC_DIR || "public",
			srcPagesDir: process.env.PAGES_DIR  || "src/pages",
			cacheDir:    process.env.CACHE_DIR  || "__cache__",
			exportDir:   process.env.EXPORT_DIR || "__export__",
		},
		document: "", // Defer to dev and export
		pages: [],    // Defer to dev and export
	}

	if (runtime.command.type === "dev") {
		await utils.preflight(runtime)
		await cmd_dev(runtime as types.Runtime<types.DevCommand>)
	} else if (runtime.command.type === "export") {
		await utils.preflight(runtime)
		await cmd_export(runtime as types.Runtime<types.ExportCommand>)
	} else if (runtime.command.type === "serve") {
		await cmd_serve(runtime as types.Runtime<types.ServeCommand>)
	}
}

process.on("uncaughtException", (err: Error): void => {
	process.env["STACK_TRACE"] = "true"
	err.message = `UncaughtException: ${err.message}`
	log.error(err)
})

run()
