import * as fs from "fs"
import * as os from "os"
import * as path from "path"

// TODO: Should read the canonical binary path from package.json.
const CANONICAL_BINARY = "go-npm-test"

const supported: Record<string, string> = {
	"darwin arm64 LE": "darwin-64", // Forward to darwin-64
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

// Resolves to an absolute binary path.
function bin(name: string) {
	return path.join(__dirname, "bin", name)
}

function createCanonicalBinary(binary: string) {
	const src = bin(binary)
	const dst = bin(CANONICAL_BINARY)

	fs.copyFileSync(src, dst)
	fs.chmodSync(dst, 0o755)

	if (fs.existsSync(bin("darwin-64"))) {
		fs.rmSync(bin("darwin-64"))
	}
	if (fs.existsSync(bin("linux-64"))) {
		fs.rmSync(bin("linux-64"))
	}
	if (fs.existsSync(bin("windows-64.exe"))) {
		fs.rmSync(bin("windows-64.exe"))
	}
}

function run() {
	const platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`

	const binary = supported[platformKey]
	if (!binary) {
		console.error(`unsupported platform: ${platformKey}`)
		process.exit(1)
	}

	// prettier-ignore
	try {
		createCanonicalBinary(binary)
	} catch (err) {
		throw new Error("an unexpected error occurred: " +
      ((err && err.message) || err))
	}
}

run()
