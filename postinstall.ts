const fs = require("fs")
const os = require("os")
const path = require("path")

const supported: Record<string, string> = {
	"darwin arm64 LE": "darwin-64",
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

function canonicalize(binary: string) {
	const src = path.join(__dirname, binary)
	const dst = path.join(__dirname, process.env.BINARY)
	fs.copyFileSync(src, dst)
	fs.chmodSync(dst, 0o755)
}

function run() {
	const key = `${process.platform} ${os.arch()} ${os.endianness()}`
	const binary = supported[key]
	if (!binary) {
		console.error(`Your platform is not yet supported: key=${JSON.stringify(key)}`)
		process.exit(1)
	}
	try {
		canonicalize(binary)
	} catch (err) {
		throw new Error(`An unexpected error occurred: err=${JSON.stringify(err.message)}`)
	}
}

run()
