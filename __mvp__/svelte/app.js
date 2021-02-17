const esbuild = require("esbuild")
const fs = require("fs/promises")
const helpers = require("./prerenderers/helpers.js")
const sveltePlugin = require("./prerenderers/svelte-plugin.js")

let configs = {}

async function run(runtime) {
	configs = await helpers.load_user_configs()

	// __cache__/App.svelte
	const out1 = `<script>
	import { Route } from "../router"

	${runtime.page_based_router.map(each => `import ${each.component} from "../${each.src_path}"`).join("\n\t")}
</script>

${runtime.page_based_router
	.map(
		each => `<Route path="${each.path}">
	<${each.component} />
</Route>
`,
	)
	.join("\n")}`
	fs.writeFile(`${runtime.dir_config.cache_dir}/App.svelte`, out1)

	// __cache__/main.js
	const out2 = `import App from "./App.svelte"

export default new App({
	hydrate: true,
	target: document.getElementById("app"),
})
`
	fs.writeFile(`${runtime.dir_config.cache_dir}/main.js`, out2)

	const result = await esbuild.build({
		bundle: true,
		define: {
			__DEV__: process.env.__DEV__,
			NODE_ENV: process.env.NODE_ENV,
		},
		entryPoints: [`${runtime.dir_config.cache_dir}/main.js`],
		minify: process.env.NODE_ENV === "production",
		outfile: `${runtime.dir_config.build_dir}/app.js`,
		plugins: [
			sveltePlugin({
				generate: "dom",
				hydratable: true,
			}),
			...configs.svetlana.plugins,
		],
		sourcemap: runtime.command.source_map,
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

	console.log(
		JSON.stringify({
			data: {},
			errors: [],
			warnings: [],
		}),
	)
}
