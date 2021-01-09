import fs from "fs"

export default function guards() {
	if (!fs.existsSync("cache")) {
		fs.mkdirSync("cache")
	}
	if (!fs.existsSync("cache/__pageProps.json")) {
		fs.writeFileSync("cache/__pageProps.json", JSON.stringify({}, null, "\t"))
	}
	if (!fs.existsSync("build")) {
		fs.mkdirSync("build")
	}
	// Server guards passed; OK to proceed.
}
