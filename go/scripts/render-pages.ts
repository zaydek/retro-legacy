import * as types from "./types"
import esbuild from "esbuild"
import fs from "fs/promises"
import path from "path"
import React from "react"
import ReactDOMServer from "react-dom/server"

// prettier-ignore
interface Meta {
	fs_path: string // Filesystem path
	path:    string
	props?:  types.ResolvedProps
	exports: types.StaticPage | types.DynamicPage
}

async function renderPage(runtime: types.Runtime, meta: Meta) {
	let head = "<!-- <Head {...resolvedProps}> -->"
	if (typeof meta.exports.Head === "function") {
		// TODO: Warn on non-functions.
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.exports.Head, meta.props))
	}

	let page = "<!-- <Head {...resolvedProps}> -->"
	// TODO: Warn on non-functions.
	page = ReactDOMServer.renderToString(React.createElement(meta.exports.default, meta.props))

	// prettier-ignore
	const html = runtime.base_page
		.replace("%head%", head
			.replace(/></g, ">\n\t\t<")
			.replace(/\/>/g, " />"),
		)
		.replace("%page%", `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">${page}</div>
		<script src="/app.js"></script>`)

	await fs.writeFile(meta.fs_path, html)
}

async function run(runtime: types.Runtime) {
	const service = await esbuild.startService()

	try {
		// TODO: Upgrade to Promise.all (maybe add --concurrent?).
		for (const route of runtime.page_based_router) {
			let srcPath = route.src_path
			let dst = path.join(runtime.dir_config.cache_dir, srcPath.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))

			await service.build({
				bundle: true,
				define: {
					__DEV__: "true",
					"process.env.NODE_ENV": JSON.stringify("development"),
				},
				entryPoints: [srcPath],
				// NOTE: Use "external" to prevent a React error: You might have
				// mismatching versions of React and the renderer (such as React DOM).
				external: ["react", "react-dom"],
				format: "cjs",
				loader: {
					".js": "jsx",
				},
				logLevel: "silent", // TODO
				outfile: dst,
				// plugins: [...configs.retro.plugins],
			})
			// TODO: Handle warnings and hints.

			const mod = require("../" + dst)

			// TODO: Add cache check here.

			let resolvedProps: types.ResolvedProps
			if (typeof mod.resolveServerProps === "function") {
				resolvedProps = await mod.resolveServerProps()
			}

			let resolvedPaths: types.ResolvedPaths
			if (typeof mod.resolveServerPaths === "function") {
				const resolvedPathsArray: types.ResolvedPathsArray = await mod.resolveServerPaths(resolvedProps)
				resolvedPaths = resolvedPathsArray.reduce((accum, each) => {
					accum[each.path] = {
						route,
						props: each.props,
					}
					return accum
				}, {})

				// Cache resolvedPaths for --cached:
				const resolvedPathsPath = path.join(runtime.dir_config.cache_dir, "resolvedPaths.json")
				await fs.writeFile(resolvedPathsPath, JSON.stringify(resolvedPaths, null, "\t") + "\n")

				for (const [path_, props] of Object.entries(resolvedPaths)) {
					const fs_path = path.join(...[...dst.split(path.sep).slice(0, -1), path_ + ".html"])
					const meta: Meta = { fs_path, path: path_, props, exports }
					await renderPage(runtime, meta)
				}
				continue
			}

			const meta: Meta = { fs_path: route.dst_path, path: route.path, exports }
			await renderPage(runtime, meta)
		}
	} catch (err) {
		// console.error(err.message)
		throw err
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
