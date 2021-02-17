const cachedSveltePlugin = require("./prerenderers/svelte-plugin.js")
const esbuild = require("esbuild")
const helpers = require("./prerenderers/helpers.js")
const prettier = require("prettier")

let configs = {}

// prerenderComponent prerenders a component from a page-based route.
const prerenderComponent = service => async (runtime, page_based_route) => {
	const result = await service.build({
		bundle: true,
		define: {
			__DEV__: process.env.__DEV__,
			NODE_ENV: process.env.NODE_ENV,
		},
		entryPoints: [page_based_route.src_path],
		format: "cjs",
		outfile: `${runtime.dir_config.cache_dir}/${helpers.no_ext(page_based_route.src_path)}.esbuild.js`,
		plugins: [
			cachedSveltePlugin({
				generate: "ssr",
			}),
			...configs.svetlana.plugins,
		],
	})
	if ((result.errors && result.errors.length > 0) || (result.warnings && result.warnings.length > 0)) {
		console.log(
			JSON.stringify({
				data: {},
				errors: result.errors,
				warnings: result.errors,
			}),
		)
		process.kill(1)
	}
	const component = require(`./${runtime.dir_config.cache_dir}/${helpers.no_ext(page_based_route.src_path)}.esbuild.js`).default
	return component.render()
}

// prerenderPage prerenders a page from a rendered component.
async function prerenderPage(runtime, component) {
	// prettier-ignore
	const head = component.head
		.replace(/></g, ">\n\t\t<")
		.replace(/\/>/g, " />")

	const body = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="app">

${component.html.trim()}

		</div>
		<script src="/app.js" type="module"></script>`

	// prettier-ignore
	let page = runtime.base_page
		.replace("%head%", head)
		.replace("%page%", body)

	if (runtime.command.prettier) {
		page = prettier.format(page, {
			...configs.prettier,
			parser: "html",
		})
	}
	return page
}

// prettier-ignore
async function run(runtime) {
	configs = await helpers.load_user_configs()

	const service = await esbuild.startService()

	try {
		const promises = []
		for (const each of runtime.page_based_router) {
			const p = new Promise(async resolve => {
				const component = await prerenderComponent(service)(runtime, each)
				const page = await prerenderPage(runtime, component)
				resolve({ ...each, page })
			})
			promises.push(p)
		}

		const arr = await Promise.all(promises)
		const map = arr.reduce((acc, each) => {
			acc[each.path] = each
			return acc
		}, {})

		console.log(
			JSON.stringify({
				data: map,
				errors: [],
				warnings: [],
			}),
		)
	}

	finally {
		service.stop()
	}
}
