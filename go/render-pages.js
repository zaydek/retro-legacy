const esbuild = require("esbuild")
const fs = require("fs/promises")
const path = require("path")
const React = require("react")
const ReactDOMServer = require("react-dom/server")

async function run(runtime) {
	for (const route of runtime.page_based_router) {
		const src = route.src_path
		const dst = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))

		try {
			await esbuild.build({
				bundle: true,
				define: {
					__DEV__: true,
					"process.env.NODE_ENV": JSON.stringify("development"),
				},
				format: "cjs",
				entryPoints: [src],
				format: "cjs",
				outfile: dst,
				loader: {
					".js": "jsx",
				},
				logLevel: "silent",
			})
		} catch (err) {
			console.log(err.message)
			return
		}

		let html
		try {
			const mod = require("./" + dst)

			let head = "<!-- <Head> -->"
			if (mod.Head !== undefined) {
				head = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head))
			}
			const page = ReactDOMServer.renderToString(React.createElement(mod.default))

			// prettier-ignore
			html = runtime.base_page
				.replace("%head%", head)
					.replace(/></g, ">\n\t\t<")
					.replace(/\/>/g, " />")
				.replace("%page%", `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="react-root">${page}</div>
		<script src="/app.js"></script>`)
		} catch (err) {
			console.log(err.message)
			return
		}

		await fs.writeFile(route.dst_path, html)
	}
}

run(require("./__cache__/runtime.js"))
