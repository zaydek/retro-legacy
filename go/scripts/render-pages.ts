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

const cachedServerRouter: types.ServerRouter = {}

// "/" -> "/index.html"
// "/nested/" -> "/nested/index.html"
function pathToHTML(path: string): string {
	if (!path.endsWith("/")) return path + ".html"
	return path + "index.html"
}

// renderToDisk renders a render payload to disk.
async function renderToDisk(runtime: types.Runtime, render: RenderPayload): void {
	let head = "<!-- <Head {...props}> -->"
	if (typeof render.module.Head === "function") {
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.serverProps))
	}

	let page = "<!-- <Page {...props}> -->"
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

async function run(runtime: types.Runtime): Promise<void> {
	const service = await esbuild.startService()

	// TODO: Upgrade to Promise.all (add --concurrent?).
	for (const filesystemRoute of runtime.filesystemRouter) {
		// Generate paths for esbuild:
		const entryPoints = [filesystemRoute.inputPath]
		const outfile = path.join(
			runtime.directoryConfiguration.cacheDir,
			entryPoints[0]!.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"),
		)

		await service.build({
			bundle: true,
			define: {
				__DEV__: "true",
				"process.env.NODE_ENV": JSON.stringify("development"),
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
		// TODO: Add cache serverProps here.

		let serverProps: types.ServerProps
		if (typeof exports.serverProps === "function") {
			serverProps = await exports.serverProps()
			serverProps = {
				path: filesystemRoute.path, // Add path
				...serverProps,
			}
		}

		if (typeof exports.serverPaths === "function") {
			const descriptServerPaths: types.DescriptiveServerPaths = await exports.serverPaths(serverProps)
			const serverRouter = descriptServerPaths.reduce<types.ServerRouter>((accum, serverProps) => {
				accum[filesystemRoute.path] = {
					filesystemRoute,
					serverProps,
				}
				return accum
			}, {})

			// if (serverRouter !== undefined) {
			for (const [path_, meta] of Object.entries(serverRouter)) {
				// TODO: Warn here for repeat paths.
				cachedServerRouter[path_] = meta
			}
			// }

			for (const [path_, meta] of Object.entries(serverRouter)) {
				const render: RenderPayload = {
					outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
					path: path_,
					module: mod,
					serverProps: meta.serverProps,
				}
				// TODO: What the hell?
				await renderToDisk(runtime, render)
			}
			continue
		}

		// TODO: Warn here for repeat paths.
		const path_ = filesystemRoute.path
		const render: RenderPayload = {
			outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
			path: path_,
			module: mod,
			serverProps: serverProps,
		}
		// TODO: What the hell?
		await renderToDisk(runtime, render)
	}

	// Cache cachedServerRouter for --cached:
	const cachedServerRouterPath = path.join(runtime.directoryConfiguration.cacheDir, "serverRouter.json")
	const data = JSON.stringify(cachedServerRouter, null, "\t") + "\n" // EOF
	await fs.writeFile(cachedServerRouterPath, data)
}

;(async () => {
	try {
		await run(require("../__cache__/runtime.json"))
	} catch (error) {
		console.error(error.stack)
		// console.error({
		// 	stack: error.stack,
		// 	errno: error.errno,
		// 	code: error.code,
		// 	syscall: error.syscall,
		// 	path: error.path,
		// })
	}
})()
