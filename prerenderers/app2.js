const cachedSveltePlugin = require("./cached-svelte-plugin.js")
const esbuild = require("esbuild")
const fs = require("fs/promises")
const helpers = require("./helpers.js")

let configs = {}

// ${runtime.page_based_router.map(each => `import ${each.component} from "./${each.src_path}"`).join("\n\t")}

// ${runtime.page_based_router.map(each => `import ${each.component} from "../${each.src_path}"`).join("\n\t")}

// ${runtime.page_based_router
// 	.map(
// 		each => `<Route path="${each.path}">
// 	<${each.component} />
// </Route>

async function run(runtime) {
	const t = Date.now()

	configs = await helpers.load_user_configs()

	// __cache__/App.svelte
	const out1 = `<script>
	import { Route } from "./router"
</script>

${runtime.page_based_router
	.map(
		each => `<Route path="${each.path}">
	{#await import("./${each.src_path}").then(module => module.default) then ${each.component}}
		<${each.component} />
	{/await}
</Route>
`,
	)
	.join("\n")}`
	fs.writeFile(`App.svelte`, out1)

	// __cache__/main.js
	const out2 = `import App from "./App.svelte"

export default new App({
	hydrate: true,
	target: document.getElementById("app"),
})
`
	fs.writeFile(`app.js`, out2)

	const result = await esbuild.build({
		// incremental: true,

		bundle: true,
		define: {
			__DEV__: process.env.__DEV__,
			NODE_ENV: process.env.NODE_ENV,
		},
		// entryPoints: [`app.js`],
		entryPoints: [`app.js`],
		format: "esm",
		// minify: process.env.NODE_ENV === "production",
		minify: true,
		// outfile: `${runtime.dir_config.build_dir}/app.js`,
		outdir: runtime.dir_config.build_dir,
		plugins: [
			cachedSveltePlugin({
				generate: "dom",
				hydratable: true,
			}),
			...configs.svetlana.plugins,
		],
		splitting: true,
		// sourcemap: runtime.command.source_map,
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

	// fs.unlink(`App.svelte`)
	// fs.unlink(`app.js`)

	console.log(
		JSON.stringify({
			data: {},
			errors: [],
			warnings: [],
		}),
	)

	console.log(Date.now() - t)
}

run({
	command: {
		cached: false,
		prettier: true,
		source_map: true,
	},
	dir_config: {
		asset_dir: "public",
		pages_dir: "pages",
		cache_dir: "__cache__",
		build_dir: "build",
	},
	base_page: '\u003c!DOCTYPE html\u003e\n\u003chtml lang="en"\u003e\n\t\u003chead\u003e\n\t\t\u003cmeta charset="utf-8" /\u003e\n\t\t\u003cmeta name="viewport" content="width=device-width, initial-scale=1" /\u003e\n\t\t%head%\n\t\u003c/head\u003e\n\t\u003cbody\u003e\n\t\t%page%\n\t\u003c/body\u003e\n\u003c/html\u003e\n',
	page_based_router: [
		{ src_path: "pages/index.svelte", dst_path: "build/nested/index.svelte", path: "/", component: "PageIndex" },
		{ src_path: "pages/nested/index.svelte", dst_path: "build/nested/index.svelte", path: "/nested/", component: "PageNestedIndex" },
		{ src_path: "pages/a.svelte", dst_path: "build/a.svelte", path: "/a", component: "PageA" },
		{ src_path: "pages/b.svelte", dst_path: "build/b.svelte", path: "/b", component: "PageB" },
		{ src_path: "pages/c.svelte", dst_path: "build/c.svelte", path: "/c", component: "PageC" },
		{ src_path: "pages/d.svelte", dst_path: "build/d.svelte", path: "/d", component: "PageD" },
		{ src_path: "pages/e.svelte", dst_path: "build/e.svelte", path: "/e", component: "PageE" },
		{ src_path: "pages/f.svelte", dst_path: "build/f.svelte", path: "/f", component: "PageF" },
		{ src_path: "pages/g.svelte", dst_path: "build/g.svelte", path: "/g", component: "PageG" },
		{ src_path: "pages/h.svelte", dst_path: "build/h.svelte", path: "/h", component: "PageH" },
		{ src_path: "pages/i.svelte", dst_path: "build/i.svelte", path: "/i", component: "PageI" },
		{ src_path: "pages/j.svelte", dst_path: "build/j.svelte", path: "/j", component: "PageJ" },
		{ src_path: "pages/k.svelte", dst_path: "build/k.svelte", path: "/k", component: "PageK" },
		{ src_path: "pages/l.svelte", dst_path: "build/l.svelte", path: "/l", component: "PageL" },
		{ src_path: "pages/m.svelte", dst_path: "build/m.svelte", path: "/m", component: "PageM" },
		{ src_path: "pages/n.svelte", dst_path: "build/n.svelte", path: "/n", component: "PageN" },
		{ src_path: "pages/o.svelte", dst_path: "build/o.svelte", path: "/o", component: "PageO" },
		{ src_path: "pages/p.svelte", dst_path: "build/p.svelte", path: "/p", component: "PageP" },
	],
})
