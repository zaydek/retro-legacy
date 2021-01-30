const fs = require("fs")
const os = require("os")
const path = require("path")

const CANONICAL_BINARY = "create-retro-app"

const supported: Record<string, string> = {
	"darwin arm64 LE": "darwin-64", // TODO: Upgrade to support M1
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

function copyBinaryToCanonicalBinary(binary: string) {
	const src = path.join(__dirname, binary)
	const dst = path.join(__dirname, CANONICAL_BINARY)
	fs.copyFileSync(src, dst)
	fs.chmodSync(dst, 0o755)
}

function run() {
	const platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`

	const binary = supported[platformKey]
	if (!binary) {
		console.error(`unsupported platform: ${platformKey}`)
		process.exit(1)
	}

	try {
		copyBinaryToCanonicalBinary(binary)
	} catch (err) {
		throw new Error(`unexpected error: ${err.message || err}`)
	}
}

run()
