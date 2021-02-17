const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")
const React = require("react")
const ReactDOMServer = require("react-dom/server")

// 	const p = new Promise(async resolve => {
// 		const component = await prerenderComponent(service)(runtime, each)
// 		const page = await prerenderPage(runtime, component)
// 		resolve({ ...each, page })
// 	})
// 	promises.push(p)
// }
//
// const arr = await Promise.all(promises)
// const map = arr.reduce((acc, each) => {
// 	acc[each.path] = each
// 	return acc
// }, {})

async function renderPage(runtime, mod, props) {
	let head = "<!-- <Head> -->"
	if (typeof mod.Head === "function") {
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, props))
	}
	const page = ReactDOMServer.renderToString(React.createElement(mod.default, props))

	// prettier-ignore
	const html = runtime.base_page
		.replace("%head%", head)
			.replace(/></g, ">\n\t\t<")
			.replace(/\/>/g, " />")
		.replace("%page%", `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="react-root">${page}</div>
		<script src="/app.js"></script>`)

	console.log(html)

	// await fs.writeFile(route.dst_path, html)
}

async function run(runtime) {
	const service = await esbuild.startService()

	try {
		// TODO: Upgrade to Promise.all (maybe add --concurrent?).
		for (const route of runtime.page_based_router) {
			const src = route.src_path
			const dst = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))

			await service.build({
				bundle: true,
				define: {
					__DEV__: true,
					"process.env.NODE_ENV": JSON.stringify("development"),
				},
				entryPoints: [src],
				format: "cjs",
				loader: {
					".js": "jsx",
				},
				logLevel: "silent", // TODO
				outfile: dst,
				// plugins: [...configs.retro.plugins],
			})
			// TODO: Handle warnings and hints.

			// TODO: Resolve server props and paths.

			const mod = require("../" + dst)

			let serverProps
			if (typeof mod.resolveServerProps === "function") {
				serverProps = await mod.resolveServerProps()
			}

			let serverPaths
			if (typeof mod.resolveServerPaths === "function") {
				serverPaths = await mod.resolveServerPaths(serverProps)
			}

			if (serverPaths !== undefined) {
				for (const serverInfo of serverPaths) {
					const { path, props } = serverInfo
					await renderPage(runtime, mod, { path, ...props })
				}
			} else {
				await renderPage(runtime, mod)
			}
		}
	} catch (err) {
		console.error(err.message)
		process.exit(1)
	}
}

run(require("../__cache__/runtime.json"))
