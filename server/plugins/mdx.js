const fs = require("fs")
const mdx = require("@mdx-js/mdx")

const missingImportStatements = `
import React from "react"
import ReactDOM from "react-dom"

import { mdx } from "@mdx-js/react"

ReactDOM.render(
`.trim()

module.exports = {
	name: "mdx",
	setup(build) {
		build.onLoad({ filter: /\.mdx$/ }, async args => {
			const text = await fs.promises.readFile(args.path, "utf8")
			let jsx = await mdx(text)
			jsx = missingImportStatements + "\n\n" + jsx
			return {
				contents: jsx,
				loader: "jsx",
			}
		})
	},
}
