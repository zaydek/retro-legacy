import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"
import * as types from "./types"

async function run(runtime: types.Runtime): Promise<void> {
	const srvRouterPath = path.join(runtime.directoryConfiguration.cacheDir, "cachedServerRouter.json")
	const srvRouter: types.ServerRouter = require("../" + srvRouterPath)

	// Get a set of component keys:
	const compKeys = [...new Set(Object.keys(srvRouter).map(keys => srvRouter[keys]!.filesystemRoute.component))]

	// Create a shared server router based on shared component keys:
	const sharedSrvRouter: types.ServerRouter = {}

	// prettier-ignore
	for (const [, meta] of Object.entries(srvRouter)) {
		const comp = meta.filesystemRoute.component
		if (compKeys.includes(comp) &&
				sharedSrvRouter[comp] === undefined) {
			sharedSrvRouter[comp] = meta
		}
	}

	const cachePath = path.join(runtime.directoryConfiguration.cacheDir, "app.js")
	const exportPath = path.join(runtime.directoryConfiguration.exportDir, "app.js")

	const data = `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedSrvRouter)
	.map(([, { filesystemRoute }]) => `import ${filesystemRoute.component} from "../${filesystemRoute.inputPath}"`)
	.join("\n")}

import srvRouter from "./cachedServerRouter.json"

export default function App() {
	return (
		<Router>
${
	Object.entries(srvRouter)
		.map(
			([path_, meta]) => `
			<Route path="${path_}">
				<${meta.filesystemRoute.component} {...{
					path: "${path_}",
					...srvRouter["${path_}"].serverProps,
				}} />
			</Route>`,
		)
		.join("\n") + "\n"
}
		</Router>
	)
}

ReactDOM.hydrate(
	// <React.StrictMode> // TODO
	<App />,
	// </React.StrictMode>
	document.getElementById("root"),
)
`
	await fs.writeFile(cachePath, data)

	await esbuild.build({
		bundle: true,
		define: {
			__DEV__: "true", // TODO
			"process.env.NODE_ENV": JSON.stringify("development"), // TODO
		},
		entryPoints: [cachePath],
		// format: "cjs",
		loader: {
			".js": "jsx",
		},
		logLevel: "silent", // TODO
		outfile: exportPath,
		// plugins: [...configs.retro.plugins],
	})
}

;(async () => {
	try {
		await run(require("../__cache__/runtime.json"))
	} catch (error) {
		console.error(error.stack)
	}
})()
