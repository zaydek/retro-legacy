const CANONICAL_BINARY = Object.keys(require("./package.json")["bin"])[0]

// Maps platform keys to binary names where where platform keys are described by
// `${process.platform} ${os.arch()} ${os.endianness()}` (see run).
const supported = {
	"darwin arm64 LE": "darwin-64",
	"darwin x64 LE": "darwin-64",
	"linux x64 LE": "linux-64",
	"win32 x64 LE": "windows-64.exe",
}

async function copyToCanonicalBinaryFilename(binary) {
	const fs = require("fs/promises")
	const path = require("path")

	const src = path.join(__dirname, "bin", binary)
	const dst = path.join(__dirname, "bin", CANONICAL_BINARY)
	await fs.copyFile(src, dst)
	await fs.chmod(dst, 0o755)
}

async function run() {
	const os = require("os")

	const platformKey = `${process.platform} ${os.arch()} ${os.endianness()}`
	const binary = supported[platformKey]
	if (!binary) {
		console.error(
			`[create-retro-retro]: Your platform is not yet supported; platformKey=${JSON.stringify(platformKey)}. ` +
				`To add support for your platform, open https://github.com/zaydek/retro/issues/new?title=${encodeURIComponent(
					`[Feature] Add support for platformKey=${JSON.stringify(platformKey)}`,
				)}.`,
		)
		process.exit(1)
	}
	try {
		await copyToCanonicalBinaryFilename(binary)
	} catch (err) {
		throw new Error(`[create-retro-retro]: An unexpected error occurred; err.message=${JSON.stringify(err.message)}.`)
	}
}

run()
