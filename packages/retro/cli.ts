import * as log from "../lib/log"
// import * as term from "../lib/term"
import * as usage from "./cli-usage"

function run() {
	const argv = process.argv0 === "node" ? process.argv.slice(1) : process.argv

	// Cover ["retro"] case:
	if (argv.length === 1) {
		console.log(usage.body)
		process.exit(0)
	}

	// console.log(process.argv0)

	// var cmd interface{}
	const arg = argv[1]
	if (arg == "version" || arg == "--version" || arg == "--v") {
		console.log(process.env["RETRO_VERSION"] || "TODO")
		process.exit(0)
	} else if (arg == "usage" || arg == "--usage" || arg == "help" || arg == "--help") {
		console.log(usage.body)
		process.exit(0)
	} else if (arg == "dev") {
		process.env["__DEV__"] = "true"
		process.env["NODE_ENV"] = "development"
		// cmd = parseDevArguments(os.Args[2:]...)
	} else if (arg == "export") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		// cmd = parseExportArguments(os.Args[2:]...)
	} else if (arg == "serve") {
		process.env["__DEV__"] = "false"
		process.env["NODE_ENV"] = "production"
		// cmd = parseServeArguments(os.Args[2:]...)
	} else {
		// prettier-ignore
		log.error("Unrecognized command. " +
			"These are the commands:\n\n" +
			usage.cmds.split("\n").map(each => " ".repeat(2) + each).join("\n"))
		process.exit(2)
	}
}

run()
