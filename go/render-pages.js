async function run(runtime) {
	const esbuild = require("esbuild")
	// const fs = require("fs/promises")
	const path = require("path")
	const React = require("react")
	const ReactDOMServer = require("react-dom/server")

	const route = runtime.page_based_router[0]

	const src = route.src_path
	const dst = path.join(runtime.dir_config.cache_dir, src.replace(/\.(jsx?|tsx?)$/, ".esbuild.$1"))

	const result = await esbuild.build({
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
	})

	const mod = require("./" + dst).default
	console.log(ReactDOMServer.renderToString(React.createElement(mod)))
}

run(require("./__cache__/runtime.js"))
