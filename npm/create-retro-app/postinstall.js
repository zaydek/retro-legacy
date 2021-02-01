const fs = require("fs")
const os = require("os")
const path = require("path")

const CANONICAL_BINARY = "create-retro-app"

const supported = {
	"darwin arm64 LE": "darwin-64",
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

function copyBinaryToCanonicalBinary(binary) {
	const src = path.join(__dirname, "bin", binary)
	const dst = path.join(__dirname, "bin", CANONICAL_BINARY)
	fs.copyFileSync(src, dst)
	fs.chmodSync(dst, 0o755)
}

function run() {
	const platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`
	const binary = supported[platformKey]
	if (!binary) {
		console.error(`Your platform is not yet supported: platformKey=${JSON.stringify(platformKey)}`)
		process.exit(1)
	}
	try {
		copyBinaryToCanonicalBinary(binary)
	} catch (err) {
		throw new Error(`An unexpected error occurred: err=${JSON.stringify(err.message)}`)
	}
}

run()
