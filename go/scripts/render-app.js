async function run(runtime) {
	const esbuild = require("esbuild")
	const fs = require("fs/promises")
	const path = require("path")
	// const React = require("react")
	// const ReactDOMServer = require("react-dom/server")

	try {
		const App = false

		const data = `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// App
// TODO

// Pages
${runtime.page_based_router.map(route => `import ${route.component} from "../${route.src_path}"`).join("\n")}

// Cached props
// TODO

export default function RoutedApp() {
	return (
		<Router>
			${runtime.page_based_router
				.map(route =>
					!App
						? `
			<Route path="${route.path}">
				<${route.component} {...cachedProps["${route.path}"]} />
			</Route>`
						: `
			<Route path="${route.path}">
				<App {...cachedProps["${route.path}"]}>
					<${route.component} {...cachedProps["${route.path}"]} />
				</App>
			</Route>`,
				)
				.join("\n")}

		</Router>
	)
}

${
	true // TODO
		? `ReactDOM.hydrate(
	<RoutedApp />,
	document.getElementById("react-root"),
)`
		: `ReactDOM.hydrate(
	<React.StrictMode>
		<RoutedApp />
	</React.StrictMode>,
	document.getElementById("react-root"),
)`
}
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
		console.error(err.message)
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
