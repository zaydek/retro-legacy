import * as log from "../../shared/log"
import * as T from "../types"
import * as terminal from "../../shared/terminal"

// TODO: Add accent here?

// parseDevCommand parses the dev command.
export function parseDevCommand(...args: string[]): T.DevCommand {
	const cmd: T.DevCommand = {
		type: "dev",
		fast_refresh: true,
		sourcemap: true,
		port: 8000,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--fast-refresh")) {
			if (arg === "--fast-refresh") {
				continue
			} else if (arg === "--fast-refresh=true" || arg === "--fast-refresh=false") {
				cmd.fast_refresh = JSON.parse(arg.slice("--fast-refresh=".length))
			} else {
				badCmd = "--fast-refresh"
				break
			}
		} else if (arg.startsWith("--sourcemap")) {
			if (arg === "--sourcemap") {
				continue
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
		log.fatal(`Bad command ${terminal.magenta(`'${badCmd}'`)}. Use ${terminal.magenta("'retro help'")} for help.`)
	}
	if (cmd.port < 1_000 || cmd.port >= 10_000) {
		log.fatal(`${terminal.magenta("'--port'")} must be between 1000-9999.`)
	}
	return cmd
}

// parseExportCommand parses the export command.
export function parseExportCommand(...args: string[]): T.ExportCommand {
	const cmd: T.ExportCommand = {
		type: "export",
		sourcemap: true,
	}
	let badCmd = ""
	for (const arg of args) {
		if (arg.startsWith("--sourcemap")) {
			if (arg === "--sourcemap") {
				continue
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
		log.fatal(`Bad command ${terminal.magenta(`'${badCmd}'`)}. Use ${terminal.magenta("'retro help'")} for help.`)
	}
	return cmd
}

// parseServeCommand parses the serve command.
export function parseServeCommand(...args: string[]): T.ServeCommand {
	const cmd: T.ServeCommand = {
		type: "serve",
		port: 8000,
	}
	let badCmd = ""
	for (const arg of args) {
		// if (arg.startsWith("--mode")) {
		// 	if (arg === "--mode=spa") {
		// 		cmd.mode = "spa"
		// 	} else if (arg === "--mode=ssg") {
		// 		cmd.mode = "ssg"
		// 	} else {
		// 		badCmd = "--mode"
		// 		break
		// 	}
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
		log.fatal(`Bad command ${terminal.magenta(`'${badCmd}'`)}. Use ${terminal.magenta("'retro help'")} for help.`)
	}
	if (cmd.port < 1_000 || cmd.port >= 10_000) {
		log.fatal(`${terminal.magenta("'--port'")} must be between 1000-9999.`)
	}
	return cmd
}
