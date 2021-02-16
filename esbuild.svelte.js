function format_head(head) {
	// prettier-ignore
	return head
		.replace(/></g, ">\n\t\t<")
		.replace(/\/>/g, " />")
}

const undefined_regexp = / [a-z-]+="undefined"/g

// FIXME: https://github.com/sveltejs/svelte/issues/5969
function noop_undefined(body) {
	return body.replaceAll(undefined_regexp, "")
}

async function generate_page() {
	const fs = require("fs/promises")
	const terser = require("html-minifier-terser")

	await require("esbuild").build({
		bundle: true,
		define: {
			__DEV__: false, // TODO
		},
		entryPoints: ["src/App10/index.svelte"],
		format: "cjs", // Use "cjs" not "iife"
		minify: true,
		outfile: "component.out.js",
		plugins: [require("./esbuild-svelte.js")({ generate: "ssr" })],
	})
	const component = require("./component.out.js").default

	const {
		html: body,
		css: { code: css },
		head,
	} = component.render()

	const opts = {
		collapseWhitespace: true,
	}

	let bstr = await fs.readFile("./index.html")
	let data = bstr.toString()

	data = data.replace(
		"%head%",
		`${!head ? "<!-- <svelte:head> -->" : format_head(terser.minify(head, opts))}\n\t\t` +
			`${!css ? "<!-- <style> -->" : css}`,
	)

	data = data.replace(
		"%body%",
		`<noscript>You need to enable JavaScript to run this app.</noscript>\n\t\t` +
			`<div id="svelte-root">${terser.minify(noop_undefined(body || "<!-- body -->"), opts)}</div>\n\t\t` +
			`<script src="app.js" type="module"></script>`,
	)

	await fs.writeFile("build/index.html", data)
}

async function generate_app() {
	await require("esbuild").build({
		bundle: true,
		define: {
			__DEV__: false, // TODO
		},
		entryPoints: ["src/app.js"],
		// format: "iife",
		format: "esm",
		minify: true,
		// outfile: "build/app.js",
		outdir: "build",
		plugins: [
			require("./esbuild-svelte.js")({
				generate: "dom",
				hydratable: true,
			}),
		],
		sourcemap: true,
		splitting: true,
	})
}

async function run() {
	const fs = require("fs/promises")

	await fs.mkdir("build", { recursive: true })
	await generate_page()
	await generate_app()
}

run()
