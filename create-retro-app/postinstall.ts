import * as fs from "fs"
import * as os from "os"
import * as path from "path"

const canonicalBinary = "create-retro-app"

const supported: Record<string, string> = {
	"darwin arm64 LE": "darwin-64", // TODO: Upgrade to support M1
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

function absoluteBinaryPath(binary: string) {
	return path.join(__dirname, "bin", binary)
}

function copyBinaryToCanonicalBinary(binary: string) {
	const src = absoluteBinaryPath(binary)
	const dst = absoluteBinaryPath(canonicalBinary)
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
