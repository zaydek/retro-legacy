import * as cli from "./cli/cli"
import * as commands from "./commands"
import * as errors from "./errors"
import * as log from "../shared/log"
import * as runtime from "./runtime"
import * as T from "./types"
import * as terminal from "../shared/terminal"
import * as utils from "./utils"

function accent(str: string): string {
	return str.replace(/('[^']+')/g, terminal.cyan("$1"))
}

function format(usage: string): string {
	const arr = usage.split("\n")
	return arr
		.map(line => {
			if (line === "") return ""
			return "\x20" + accent(line.replace(/\t/g, "\x20\x20")) // Tabs -> spaces
		})
		.join("\n")
}

const usage = format(`
${terminal.bold("retro dev")}

	Start the dev server

		--fast-refresh=...  Use fast refresh (default 'true')
		--sourcemap=...     Add sourcemaps (default 'true')
		--port=...          Use port number (default '8000')

${terminal.bold("retro export")}

	Export the production-ready build

		--sourcemap=...     Add sourcemaps (default 'true')

${terminal.bold("retro serve")}

	Serve the production-ready build

		--port=...          Use port number (default '8000')

${terminal.bold("Examples")}

	${terminal.cyan("%")} retro dev
	${terminal.cyan("%")} retro dev --port=3000
	${terminal.cyan("%")} retro export
	${terminal.cyan("%")} retro export --cached && retro serve
	${terminal.cyan("%")} retro export && retro serve

${terminal.bold("Repository")}

	retro:   ${terminal.underline("https://github.com/zaydek/retro")}
	esbuild: ${terminal.underline("https://github.com/evanw/esbuild")}
`)

async function main(): Promise<void> {
	const args = [...process.argv]
	args.shift() // Remove node
	args.shift() // Remove esnode  // TODO: This needs to be checked for distributed versions
	args.shift() // Remove main.ts // TODO: This needs to be checked for distributed versions

	let cmdArg = "usage"
	if (args.length > 0) {
		cmdArg = args[0]!
	}

	let cmd: T.AnyCommand
	switch (cmdArg) {
		case "version":
		case "--version":
		case "--v":
			console.log(process.env["RETRO_VERSION"] ?? "TODO")
			return
		case "usage":
		case "--usage":
			console.log(usage)
			return
		case "help":
		case "--help":
			console.log(usage)
			return
		case "dev":
			utils.setEnvDevelopment()
			cmd = cli.parseDevCommand(...args.slice(1))
			break
		case "export":
			utils.setEnvProduction()
			cmd = cli.parseExportCommand(...args.slice(1))
			break
		case "serve":
			utils.setEnvProduction()
			cmd = cli.parseServeCommand(...args.slice(1))
			break
		default:
			log.fatal(errors.badCommand(cmdArg))
			break
	}

	const rt = await runtime.createRuntime(cmd!)
	if (rt.cmd.type === "dev") {
		// process.env["MODE"] = "DEV"
		await commands.dev(rt as T.Runtime<T.DevCommand>)
	} else if (rt.cmd.type === "export") {
		// process.env["MODE"] = "EXPORT"
		await commands.export(rt as T.Runtime<T.ExportCommand>)
	} else if (rt.cmd.type === "serve") {
		// process.env["MODE"] = "SERVE"
		await commands.serve(rt as T.Runtime<T.ServeCommand>)
	}
}

process.on("uncaughtException", err => {
	err.message = `UncaughtException: ${err.message}\n\n${err.stack}`
	log.fatal(err)
})

main()
