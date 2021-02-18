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

const resolvedRouter: types.ResolvedPaths = {}

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

	await fs.mkdir(path.dirname(meta.fs_path), { recursive: true })
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

			if (typeof exports.serverPaths === "function") {
				const resolvedPathsArray: types.ResolvedPathsArray = await exports.serverPaths(resolvedProps)
				const routeInfos = resolvedPathsArray.reduce<types.ResolvedPaths>((accum, each) => {
					accum[each.path] = {
						route,
						props: each.props,
					}
					return accum
				}, {})

				if (routeInfos !== undefined) {
					for (const [path_, routeInfo] of Object.entries(routeInfos)) {
						// TODO: Warn here for repeat paths.
						const decoratedProps = { path: path_, ...routeInfo.props }
						resolvedRouter[path_] = { route, props: decoratedProps }
					}
				}

				for (const [path_, routeInfo] of Object.entries(routeInfos)) {
					const fs_path = path.join(runtime.dir_config.build_dir, path_) + ".html"
					const decoratedProps = { path: path_, ...routeInfo.props }
					const meta: Meta = { fs_path, path: path_, props: decoratedProps, exports }
					await renderPage(runtime, meta)
				}
				continue
			}

			// TODO: Warn here for repeat paths.
			const path_ = route.path
			const decoratedProps = { path: path_, ...resolvedProps }
			resolvedRouter[path_] = { route, props: decoratedProps }

			const meta: Meta = { fs_path: dst, path: route.path, props: decoratedProps, exports }
			await renderPage(runtime, meta)
		}

		// Cache resolvedRouter for --cached:
		const resolvedRouterPath = path.join(runtime.dir_config.cache_dir, "resolvedRouter.json")
		await fs.writeFile(resolvedRouterPath, JSON.stringify(resolvedRouter, null, "\t") + "\n")
	} catch (err) {
		// console.error(err.message)
		throw err
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
