import fs from "fs"

// Server guards; these must run before server commands are run.
export default function serverGuards() {
	if (!fs.existsSync("cache")) {
		fs.mkdirSync("cache")
	}
	// Guarantee `prerender-html` can run before **or** after `prerender-props`:
	if (!fs.existsSync("cache/props.generated.json")) {
		fs.writeFileSync("cache/props.generated.json", JSON.stringify({}, null, "\t") + "\n")
	}
	if (!fs.existsSync("build")) {
		fs.mkdirSync("build")
	}
	// OK to proceed.
}
