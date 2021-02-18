import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"

// RenderPayload describes a render payload (page metadata).
//
// prettier-ignore
interface RenderPayload {
	outputPath:   string
	path:         string
	module:       types.StaticPageModule | types.DynamicPageModule
	serverProps?: types.ServerProps
}

// "/" -> "/index.html"
// "/nested/" -> "/nested/index.html"
function pathToHTML(path: string): string {
	if (!path.endsWith("/")) return path + ".html"
	return path + "index.html"
}

// exportPage exports a page to disk.
async function exportPage(runtime: types.Runtime, render: RenderPayload): Promise<void> {
	let head = "<!-- <Head {...{ path, ...props }}> -->"
	if (typeof render.module.Head === "function") {
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.serverProps))
	}

	let page = "<!-- <Page {...{ path, ...props }}> -->"
	if (typeof render.module.default === "function") {
		page = ReactDOMServer.renderToString(React.createElement(render.module.default, render.serverProps))
	}

	// prettier-ignore
	head = head
		.replace(/></g, ">\n\t\t<")
		.replace(/\/>/g, " />")

	page = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">${page}</div>
		<script src="/app.js"></script>`

	// prettier-ignore
	const html = runtime.baseHTML
		.replace("%head%", head)
		.replace("%page%", page)

	await fs.mkdir(path.dirname(render.outputPath), { recursive: true })
	await fs.writeFile(render.outputPath, html)
}

// exportPages exports pages to disk.
async function exportPages(runtime: types.Runtime): Promise<types.ServerRouter> {
	const appRouter: types.ServerRouter = {}

	const service = await esbuild.startService()

	// TODO: Upgrade to Promise.all (add --concurrent?).
	for (const filesystemRoute of runtime.filesystemRouter) {
		// Generate paths for esbuild:
		const entryPoints = [filesystemRoute.inputPath]
		const outfile = path.join(
			runtime.directoryConfiguration.cacheDir,
			entryPoints[0]!.replace(/\.(jsx?|tsx?)$/, ".esbuild.js"),
		)

		await service.build({
			bundle: true,
			define: {
				__DEV__: "true", // TODO
				"process.env.NODE_ENV": JSON.stringify("development"), // TODO
			},
			entryPoints,
			// NOTE: Use "external" to prevent a React error: You might have
			// mismatching versions of React and the renderer (such as React DOM).
			external: ["react", "react-dom"],
			format: "cjs",
			loader: {
				".js": "jsx",
			},
			logLevel: "silent", // TODO
			outfile,
			// plugins: [...configs.retro.plugins], // TODO
		})
		// TODO: Handle warnings and hints.

		const mod = require("../" + outfile)

		// TODO: Add cache check here.

		let serverProps: types.ServerProps
		if (typeof mod.serverProps === "function") {
			serverProps = await mod.serverProps()
			serverProps = {
				path: filesystemRoute.path, // Add path
				...serverProps,
			}
		}

		// TODO: Warn here for non-dynamic filesystem routes.
		if (typeof mod.serverPaths === "function") {
			const descriptServerPaths: types.DescriptiveServerPaths = await mod.serverPaths(serverProps)

			let router: types.ServerRouter = {}
			for (const serverPath of descriptServerPaths) {
				router[serverPath.path] = {
					filesystemRoute,
					serverProps: {
						path: serverPath.path,
						...serverPath.props,
					},
				}
			}

			for (const [path_, meta] of Object.entries(router)) {
				// Cache meta:
				//
				// TODO: Warn here for repeat paths.
				appRouter[path_] = meta
				const render: RenderPayload = {
					outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
					path: path_,
					module: mod,
					serverProps: meta.serverProps,
				}
				await exportPage(runtime, render)
			}
			continue
		}

		const path_ = filesystemRoute.path

		const meta = {
			filesystemRoute,
			serverProps: {
				path: path_,
				...serverProps,
			},
		}

		// Cache meta:
		//
		// TODO: Warn here for repeat paths.
		appRouter[path_] = meta

		const render: RenderPayload = {
			outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
			path: path_,
			module: mod,
			serverProps: serverProps,
		}
		await exportPage(runtime, render)
	}

	return appRouter
}

// renderAppSource renders the App source code (before esbuild).
//
// TODO: Write tests (pure function).
export async function renderAppSource(router: types.ServerRouter): Promise<string> {
	// Get the shared components:
	const sharedComponents = [...new Set(Object.keys(router).map(keys => router[keys]!.filesystemRoute.component))]

	// Create a shared server router based on shared component keys:
	const sharedRouter: types.ServerRouter = {}

	// prettier-ignore
	for (const [, meta] of Object.entries(router)) {
		const comp = meta.filesystemRoute.component
		if (sharedComponents.includes(comp) &&
				sharedRouter[comp] === undefined) {
			sharedRouter[comp] = meta
		}
	}

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../router"

// Shared components
${Object.entries(sharedRouter)
	.map(([, { filesystemRoute }]) => `import ${filesystemRoute.component} from "../${filesystemRoute.inputPath}"`)
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
				<${meta.filesystemRoute.component} {...{
					path: "${path_}",
					...router["${path_}"].serverProps,
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
	const appRouter = await exportPages(runtime)

	// Cache appRouter for --cached:
	const dst = path.join(runtime.directoryConfiguration.cacheDir, "router.json")
	const data = JSON.stringify(appRouter, null, "\t") + "\n" // EOF
	await fs.writeFile(dst, data)

	const appSource = await renderAppSource(appRouter)
	const appSourcePath = path.join(runtime.directoryConfiguration.cacheDir, "app.js")
	await fs.writeFile(appSourcePath, appSource)

	// Generate paths for esbuild:
	const entryPoints = [appSourcePath]
	const outfile = entryPoints[0]!.replace(
		new RegExp("^" + runtime.directoryConfiguration.cacheDir.replace("/", "\\/")), // TODO
		runtime.directoryConfiguration.exportDir,
	)

	await esbuild.build({
		bundle: true,
		define: {
			__DEV__: "true", // TODO
			"process.env.NODE_ENV": JSON.stringify("development"), // TODO
		},
		entryPoints,
		format: "iife", // DOM
		loader: {
			".js": "jsx",
		},
		logLevel: "silent", // TODO
		outfile,
		// TODO: We should probably only need to resolve plugins once.
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
