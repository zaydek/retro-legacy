const fs = require("fs")
const path = require("path")
const svelte = require("svelte/compiler")

function convertMessage({ message, start, end }) {
	let location
	if (start && end) {
		const lineText = source.split(/\r\n|\r|\n/g)[start.line - 1]
		const lineEnd = start.line === end.line ? end.column : lineText.length
		location = {
			file: filename,
			line: start.line,
			column: start.column,
			length: lineEnd - start.column,
			lineText,
		}
	}
	return { text: message, location }
}

const compile = options => async (args, input) => {
	// const source = await fs.promises.readFile(args.path, "utf8")
	const filename = path.relative(process.cwd(), args.path)

	try {
		const { js, warnings } = svelte.compile(input, {
			...options,
			filename,
		})
		const contents = js.code + `//# sourceMappingURL=` + js.map.toUrl()
		return { contents, warnings: warnings.map(convertMessage) }
	} catch (e) {
		return { errors: [convertMessage(e)] }
	}
}

// Based on:
//
// - https://esbuild.github.io/plugins/#caching-your-plugin
// - https://esbuild.github.io/plugins/#svelte-plugin
//
module.exports = (options = {}) => ({
	name: "svelte",
	setup(build) {
		const cache = new Map()

		build.onLoad({ filter: /\.svelte$/ }, async args => {
			const input = await fs.promises.readFile(args.path, "utf8")

			let key = args.path
			let value = cache.get(key)

			if (value === undefined || value.input !== input) {
				const result = await compile(options)(args, input)
				value = { input, result }
				cache.set(key, value)
			}
			return value.result
		})
	},
})
