import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as p from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"

// RenderPayload describes a render payload (page metadata).
interface RenderPayload {
	outputPath: string
	path: string
	module: types.StaticPageModule | types.DynamicPageModule
	props?: types.DescriptiveServerProps
}

// "/" -> "/index.html"
// "/nested/" -> "/nested/index.html"
function pathToHTML(path: string): string {
	if (!path.endsWith("/")) return path + ".html"
	return path + "index.html"
}

// exportPage exports a page.
async function exportPage(runtime: types.Runtime, render: RenderPayload): Promise<void> {
	// Render head:
	let head = "<!-- <Head> -->"
	if (typeof render.module.Head === "function") {
		const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.props))
		head = markup.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
	}

	// Render page:
	let page = `
		<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>
	`.trim()

	// prettier-ignore
	if (typeof render.module.default === "function") {
		const str = ReactDOMServer.renderToString(React.createElement(render.module.default, render.props))
		page = page.replace(
			`<div id="root"></div>`,
			`<div id="root">${str}</div>`,
		)
	}

	// prettier-ignore
	const data = runtime.baseHTML
		.replace("%head%", head)
		.replace("%page%", page)

	// Export:
	await fs.mkdir(p.dirname(render.outputPath), { recursive: true })
	await fs.writeFile(render.outputPath, data)
}

// exportPagesAndCreateRouter exports pages and creates a router from the return
// of mod.serverProps and mod.serverPaths.
async function exportPagesAndCreateRouter(runtime: types.Runtime): Promise<types.ServerRouter> {
	const router: types.ServerRouter = {}

	const service = await esbuild.startService()

	// TODO: Add --concurrent?
	for (const route of runtime.filesystemRouter) {
		// Generate paths for esbuild:
		const entryPoints = [route.inputPath]
		const outfile = p.join(
			runtime.directoryConfiguration.cacheDir,
			entryPoints[0]!.replace(/\.(jsx?|tsx?)$/, ".esbuild.js"),
		)

		// Use external: ["react", "react-dom"] to prevent a React error: You might
		// have mismatching versions of React and the renderer (such as React DOM).
		await service.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			},
			entryPoints,
			external: ["react", "react-dom"],
			format: "cjs", // Node.js
			inject: ["./react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			outfile,
			// plugins: [...configs.retro.plugins], // TODO
		})
		// TODO: Handle warnings, error, and hints.

		const mod = require("../" + outfile)

		// TODO: Add cache check here.

		let descriptSrvProps: types.DescriptiveServerProps = { path: route.path }
		if (typeof mod.serverProps === "function") {
			const props = await mod.serverProps()
			descriptSrvProps = {
				path: route.path, // Add path
				...props,
			}
		}

		// TODO: Warn here for non-dynamic filesystem routes.
		if (typeof mod.serverPaths === "function") {
			const descriptSrvPaths: types.DescriptiveServerPaths = await mod.serverPaths(descriptSrvProps)

			// Generate a component router:
			const compRouter: types.ServerRouter = {}
			for (const { path, props } of descriptSrvPaths) {
				compRouter[path] = {
					route,
					props: {
						path,
						...props,
					},
				}
			}

			for (const [path, { props }] of Object.entries(compRouter)) {
				// Merge the component router to the app router:
				//
				// TODO: Warn here for repeat paths.
				router[path] = { route, props }

				// Create a renderPayload for exportPage:
				const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
				const render: RenderPayload = {
					outputPath,
					path,
					module: mod,
					props,
				}
				await exportPage(runtime, render)
			}
			continue
		}

		// Merge the route to the app router:
		//
		// TODO: Warn here for repeat paths.
		const path = route.path
		router[path] = { route, props: descriptSrvProps }

		// Create a renderPayload for exportPage:
		const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
		const render: RenderPayload = {
			outputPath,
			path,
			module: mod,
			props: descriptSrvProps,
		}
		await exportPage(runtime, render)
	}

	return router
}

// renderAppSource renders the App source code (before esbuild).
//
// TODO: Write tests (pure function).
export async function renderAppSource(router: types.ServerRouter): Promise<string> {
	// Get the shared components:
	const sharedComps = [...new Set(Object.keys(router).map(keys => router[keys]!.route.component))]

	// Create a shared server router based on shared component keys:
	const sharedRouter: types.ServerRouter = {}
	for (const [, meta] of Object.entries(router)) {
		const comp = meta.route.component
		if (sharedComps.includes(comp) && sharedRouter[comp] === undefined) {
			sharedRouter[comp] = meta
		}
	}

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedRouter)
	.map(([, { route }]) => `import ${route.component} from "../${route.inputPath}"`)
	.join("\n")}

import router from "./router.json"

export default function App() {
	return (
		<Router>
${
	Object.entries(router)
		.map(
			([path_, meta]) => `
			<Route path="${path_}">
				<${meta.route.component} {...{
					path: "${path_}",
					...router["${path_}"].props,
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
}

async function run(runtime: types.Runtime): Promise<void> {
	const router = await exportPagesAndCreateRouter(runtime)

	// Cache router for --cached:
	const dst = p.join(runtime.directoryConfiguration.cacheDir, "router.json")
	const data = JSON.stringify(router, null, "\t") + "\n" // EOF
	await fs.writeFile(dst, data)

	const appSource = await renderAppSource(router)
	const appSourcePath = p.join(runtime.directoryConfiguration.cacheDir, "app.js")
	await fs.writeFile(appSourcePath, appSource)

	// Generate paths for esbuild:
	const entryPoints = [appSourcePath]
	const outfile = entryPoints[0]!.replace(
		new RegExp("^" + runtime.directoryConfiguration.cacheDir.replace("/", "\\/")),
		runtime.directoryConfiguration.exportDir,
	)

	await esbuild.build({
		bundle: true,
		define: {
			__DEV__: process.env.__DEV__!,
			"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
		},
		entryPoints,
		format: "iife", // DOM
		inject: ["./react-shim.js"],
		loader: { ".js": "jsx" },
		logLevel: "silent", // TODO
		minify: true,
		outfile,
		// TODO: We should probably only need to resolve plugins once.
		// plugins: [...configs.retro.plugins],
	})
	// TODO: Handle warnings, error, and hints.
}

;(async () => {
	try {
		await run(require("../__cache__/runtime.json"))
	} catch (error) {
		console.error(error.stack)
	}
})()
