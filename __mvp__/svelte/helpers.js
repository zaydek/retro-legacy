const fs = require("fs/promises")
const path = require("path")

async function load_user_configs() {
	let svetlana = { plugins: [] }
	let prettier = {}

	try {
		svetlana = require(path.join(process.cwd(), "svetlana.config.js"))
	} catch {}

	try {
		const prettierrc = await fs.readFile(".prettierrc")
		prettier = JSON.parse(prettierrc)
	} catch {}

	return { svetlana, prettier }
}

function no_ext(src) {
	const ext = path.extname(src)
	if (ext === "") {
		return src
	}
	return src.slice(0, -ext.length)
}

module.exports = {
	load_user_configs,
	no_ext,
}
