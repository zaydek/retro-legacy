import * as esbuild from "esbuild"
import * as fs from "fs/promises"
import * as path from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"

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
			const src = route.src_path
			const src_esbuild = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))
			const dst = src
				.replace(runtime.dir_config.pages_dir, runtime.dir_config.build_dir)
				.replace(/\.(jsx?|tsx?)$/, ".html")

			await service.build({
				bundle: true,
				define: {
					__DEV__: "true",
					"process.env.NODE_ENV": JSON.stringify("development"),
				},
				entryPoints: [src],
				// NOTE: Use "external" to prevent a React error: You might have
				// mismatching versions of React and the renderer (such as React DOM).
				external: ["react", "react-dom"],
				format: "cjs",
				loader: {
					".js": "jsx",
				},
				logLevel: "silent", // TODO
				outfile: src_esbuild,
				// plugins: [...configs.retro.plugins],
			})
			// TODO: Handle warnings and hints.

			const exports = require("../" + src_esbuild)

			// TODO: Add cache check here.

			let resolvedProps: types.ResolvedProps
			if (typeof exports.serverProps === "function") {
				resolvedProps = await exports.serverProps()
			}

			let resolvedPaths: types.ResolvedPaths
			if (typeof exports.serverPaths === "function") {
				const resolvedPathsArray: types.ResolvedPathsArray = await exports.serverPaths(resolvedProps)
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

				for (const [path_, routeMeta] of Object.entries(resolvedPaths)) {
					const fs_path = path.join(runtime.dir_config.build_dir, path_) + ".html"
					const meta: Meta = { fs_path, path: path_, props: { path: path_, ...routeMeta.props }, exports }
					await renderPage(runtime, meta)
				}
				continue
			}

			const meta: Meta = { fs_path: dst, path: route.path, props: resolvedProps, exports }
			await renderPage(runtime, meta)
		}
	} catch (err) {
		// console.error(err.message)
		throw err
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
