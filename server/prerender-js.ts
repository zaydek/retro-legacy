import fs from "fs"
import guardServer from "./guardServer"
import { buildSync, transformSync } from "esbuild"

const __DEV__ = process.env.NODE_ENV !== "production"

// Bundles JavaScript on the server.
function run() {
	guardServer()

	const srcs = fs.readdirSync("pages").filter((each: string) => {
		// prettier-ignore
		const ok = (
			!each.startsWith("_document") &&
			each.endsWith(".tsx")
		)
		return ok
	})
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const transformed = transformSync(
			`
import React from "react"
import ReactDOM from "react-dom"

import Component from "../pages/${basename}"
import pageProps from "./__pageProps.json"

ReactDOM.hydrate(
	<Component data={pageProps[${JSON.stringify(basename)}]} />,
	document.getElementById("root"),
)
`,
			{
				loader: "tsx",
			},
		)

		fs.writeFileSync(`cache/${basename}.js`, transformed.code)

		buildSync({
			bundle: true,
			define: {
				__DEV__: JSON.stringify(__DEV__),
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
			},
			entryPoints: [`cache/${basename}.js`],
			minify: !__DEV__,
			outfile: `build/${basename}.js`,
		})
	}
}

;(() => {
	run()
})()
