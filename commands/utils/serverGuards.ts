import fs from "fs"

// Server guards; these must run before server commands are run.
export default function serverGuards() {
	if (!fs.existsSync("cache")) {
		fs.mkdirSync("cache")
	}
	if (!fs.existsSync("build")) {
		fs.mkdirSync("build")
	}
	// OK to proceed.
}
