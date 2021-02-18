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

// renderToDisk renders a render payload to disk.
async function renderToDisk(runtime: types.Runtime, render: RenderPayload): Promise<void> {
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

async function run(runtime: types.Runtime): Promise<void> {
	const cachedSrvRouter: types.ServerRouter = {}

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

			let srvRouter: types.ServerRouter = {}
			for (const serverPath of descriptServerPaths) {
				srvRouter[serverPath.path] = {
					filesystemRoute,
					serverProps: {
						path: serverPath.path,
						...serverPath.props,
					},
				}
			}

			for (const [path_, meta] of Object.entries(srvRouter)) {
				// Cache meta:
				//
				// TODO: Warn here for repeat paths.
				cachedSrvRouter[path_] = meta
				const render: RenderPayload = {
					outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
					path: path_,
					module: mod,
					serverProps: meta.serverProps,
				}
				await renderToDisk(runtime, render)
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
		cachedSrvRouter[path_] = meta

		const render: RenderPayload = {
			outputPath: path.join(runtime.directoryConfiguration.exportDir, pathToHTML(path_)),
			path: path_,
			module: mod,
			serverProps: serverProps,
		}
		await renderToDisk(runtime, render)
	}

	// Cache cachedSrvRouter for --cached:
	const dst = path.join(runtime.directoryConfiguration.cacheDir, "cachedServerRouter.json")
	const data = JSON.stringify(cachedSrvRouter, null, "\t") + "\n" // EOF
	await fs.writeFile(dst, data)
}

;(async () => {
	try {
		await run(require("../__cache__/runtime.json"))
	} catch (error) {
		console.error(error.stack)
	}
})()
