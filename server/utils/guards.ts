import fs from "fs"

export default function guards() {
	if (!fs.existsSync("cache")) {
		fs.mkdirSync("cache")
	}
	if (!fs.existsSync("cache/props.generated.json")) {
		fs.writeFileSync("cache/props.generated.json", JSON.stringify({}, null, "\t") + "\n")
	}
	if (!fs.existsSync("build")) {
		fs.mkdirSync("build")
	}
	// Server guards passed; OK to proceed.
}
