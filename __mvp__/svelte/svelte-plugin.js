const fs = require("fs")
const path = require("path")
const svelte = require("svelte/compiler")

// Based on https://esbuild.github.io/plugins/#svelte-plugin.
module.exports = (options = {}) => ({
	name: "svelte",
	setup(build) {
		build.onLoad({ filter: /\.svelte$/ }, async args => {
			const convertMessage = ({ message, start, end }) => {
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

			const source = await fs.promises.readFile(args.path, "utf8")
			const filename = path.relative(process.cwd(), args.path)

			try {
				const { js, warnings } = svelte.compile(source, {
					...options,
					filename,
				})
				const contents = js.code + `//# sourceMappingURL=` + js.map.toUrl()
				return { contents, warnings: warnings.map(convertMessage) }
			} catch (e) {
				return { errors: [convertMessage(e)] }
			}
		})
	},
})
