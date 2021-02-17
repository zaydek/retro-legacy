const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")
const React = require("react")
const ReactDOMServer = require("react-dom/server")

async function renderPage(runtime, mod, { props, dst }) {
	let head = "<!-- <Head {...resolvedProps}> -->"
	if (typeof mod.Head === "function") {
		// TODO: Warn on non-functions.
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, props))
	}

	let page = "<!-- <Head {...resolvedProps}> -->"
	// TODO: Warn on non-functions.
	page = ReactDOMServer.renderToString(React.createElement(mod.default, props))

	// prettier-ignore
	const html = runtime.base_page
		.replace("%head%", head
			.replace(/></g, ">\n\t\t<")
			.replace(/\/>/g, " />"),
		)
		.replace("%page%", `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root">${page}</div>
		<script src="/app.js"></script>`)

	await fs.writeFile(dst, html)
}

async function run(runtime) {
	const service = await esbuild.startService()

	try {
		// TODO: Upgrade to Promise.all (maybe add --concurrent?).
		for (const route of runtime.page_based_router) {
			let src = route.src_path
			let dst = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))

			await service.build({
				bundle: true,
				define: {
					__DEV__: true,
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
				outfile: dst,
				// plugins: [...configs.retro.plugins],
			})
			// TODO: Handle warnings and hints.

			const mod = require("../" + dst)

			// TODO: Add cache check here.

			let resolvedProps
			if (typeof mod.resolveServerProps === "function") {
				resolvedProps = await mod.resolveServerProps()
			}

			let resolvedPaths
			if (typeof mod.resolveServerPaths === "function") {
				const resolvedPathsArray = await mod.resolveServerPaths(resolvedProps)
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
					dst = path.join(...[...dst.split(path.sep).slice(0, -1), path_ + ".html"])
					await renderPage(runtime, mod, { props: { path: path_, ...props }, dst })
				}
				continue
			}

			await renderPage(runtime, mod, { dst: route.dst_path })
		}
	} catch (err) {
		// console.error(err.message)
		throw err
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
