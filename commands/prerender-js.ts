import fs from "fs"
import { buildSync, transformSync } from "esbuild"
import { getPageSrcs, guards } from "./utils"

const __DEV__ = process.env.NODE_ENV !== "production"

// Prerenders JavaScript on the server.
function run() {
	guards()

	// Bundles dependencies (React, React DOM).
	//
	// yarn esbuild react.js \
	//   --bundle \
	//   --define:process.env.NODE_ENV=\"production\" \
	//   --outfile=react.out.js
	//
	buildSync({
		bundle: true,
		define: { "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development") },
		entryPoints: ["server/react.js"],
		minify: !__DEV__,
		outfile: "build/react.out.js",
	})

	const srcs = getPageSrcs()
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		// TODO: Should we be deserializing, e.g. `JSON.parse`, on cached props?
		const transformed = transformSync(
			`
import React from "react"
import ReactDOM from "react-dom"

import Page from "../pages/${basename}"
import props from "./props.generated.json"

ReactDOM.hydrate(
	<Page {...props[${JSON.stringify(basename)}]} />,
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
			external: ["react", "react-dom"],
			minify: !__DEV__,
			outfile: `build/${basename}.out.js`,
		})
	}
}

;(() => {
	run()
})()
