// const fs = require("fs")
// const mdx = require("@mdx-js/mdx")

const fs = require("fs")
const { transformSync } = require("esbuild")

// const missingImportStatements = `
// import React from "react"
// import { mdx } from "@mdx-js/react"
// `.trim()

// module.exports = {
// 	name: "mdx",
// 	setup(build) {
// 		build.onLoad({ filter: /\.mdx$/ }, async args => {
// 			const text = await fs.promises.readFile(args.path, "utf8")
// 			let jsx = await mdx(text)
// 			jsx = missingImportStatements + "\n\n" + jsx
// 			return {
// 				contents: jsx,
// 				loader: "jsx",
// 			}
// 		})
// 	},
// }

const mdx = fs.readFileSync("test.mdx")
console.log(
	transformSync(
		`
import React from "react"
import { mdx } from "@mdx-js/react"

${mdx}
`,
		{
			loader: "jsx",
		},
	).code,
)
