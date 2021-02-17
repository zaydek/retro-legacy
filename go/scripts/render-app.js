const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")

// // prettier-ignore
// function prettyJSON(data) {
// 	return JSON.stringify(data)
// 		.replace(/^{"/, '{ "')
// 		.replace(/"}$/, '" }')
// 		.replace(/"(:|,)"/g, '"$1 "')
// }

async function run(runtime) {
	try {
		const resolvedPathsPath = path.join(runtime.dir_config.cache_dir, "resolvedPaths.json")
		const resolvedPaths = require("../" + resolvedPathsPath)

		const componentSetKeys = [...new Set(Object.keys(resolvedPaths).map(key => resolvedPaths[key].route.component))]

		const sharedPaths = {}
		for (const [, meta] of Object.entries(resolvedPaths)) {
			if (componentSetKeys.includes(meta.route.component) && sharedPaths[meta.route.component] === undefined) {
				sharedPaths[meta.route.component] = meta
			}
		}

		const data = `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../resolvedPaths"

// Shared components
${Object.entries(sharedPaths)
	.map(([, meta]) => `import ${meta.route.component} from "../${meta.route.src_path}"`)
	.join("\n")}

import resolvedPaths from "./resolvedPaths.json"

export default function App() {
	return (
		<Router>
			${Object.entries(resolvedPaths)
				.map(
					([path_, meta]) =>
						`
				<Route path="${path_}">
					<${meta.route.component} {...{
						path: "${path_}",
						...resolvedPaths["${path_}"].props,
					}} />
				</Route>`,
				)
				.join("\n")}

		</Router>
	)
}

ReactDOM.hydrate(
	<App />,
	document.getElementById("root"),
)
`

		const src = path.join(runtime.dir_config.cache_dir, "app.js")
		const dst = path.join(runtime.dir_config.build_dir, "app.js")

		await fs.writeFile(src, data)

		await esbuild.build({
			bundle: true,
			define: {
				__DEV__: true,
				"process.env.NODE_ENV": JSON.stringify("development"),
			},
			entryPoints: [src],
			// format: "cjs",
			loader: {
				".js": "jsx",
			},
			logLevel: "silent", // TODO
			outfile: dst,
			// plugins: [...configs.retro.plugins],
		})
	} catch (err) {
		// console.error(err.message)
		throw err
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
