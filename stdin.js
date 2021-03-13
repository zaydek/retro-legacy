const fs = require("fs")

function run() {
	// NOTE: Do not use fs.promises.readFile; [ERR_INVALID_ARG_TYPE].
	const stdin = fs.readFileSync(0)
	console.log({ stdin: stdin.toString() })
}

run()
