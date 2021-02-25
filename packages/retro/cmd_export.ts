import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as loggers from "./loggers"
import * as p from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

import parsePages from "./parsePages"
import runServerGuards from "./runServerGuards"

// PageModule ambiguously describes a page module.
interface PageModule {
	Head?: (props: types.ServerResolvedProps) => JSX.Element
	default?: (props: types.ServerResolvedProps) => JSX.Element
}

// StaticPageModule describes a static page module.
interface StaticPageModule extends PageModule {
	serverProps?(): Promise<types.ServerResolvedProps>
}

// DynamicPageModule describes a dynamic page module.
interface DynamicPageModule extends PageModule {
	serverPaths(): Promise<{ path: string; props: types.Props }[]>
}

function errServerPropsFunction(src: string): string {
	return `${src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}

Or:

${term.dim(`// ${src}`)}
export async function serverProps() {
	await ...
	return { ... }
}`
}

function errServerPathsFunction(src: string): string {
	return `${src}: 'typeof serverPaths !== "function"'; 'serverPaths' must be a synchronous or an asynchronous function.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return { ... }
}

Or:

${term.dim(`// ${src}`)}
export async function serverPaths() {
	await ...
	return { ... }
}`
}

function errServerPropsMismatch(src: string): string {
	return `${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`
}

function errServerPropsReturn(src: string): string {
	return `${src}.serverProps: 'serverProps' does not resolve to a server props object.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

function errServerPathsReturn(src: string): string {
	return `${src}.serverPaths: 'serverPaths' does not resolve to a server paths object.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`
}

function errServerPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use 'serverProps' not 'serverPaths'.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

function errPathExists(r1: types.ServerRoute, r2: types.ServerRoute): string {
	return `${r1.src}: Path '${r1.path}' is already being used by ${r2.src}.`
}

// Based on https://github.com/evanw/esbuild/blob/master/lib/common.ts#L35.
// prettier-ignore
function testServerPropsReturn(value: unknown): boolean {
	return utils.testStrictObject(value)
}

// prettier-ignore
function testServerPathsReturn(value: unknown): boolean {
	type A = unknown[]
	type O = { [key: string]: unknown }

	const ok = utils.testStrictArray(value) &&
		(value as A).every(each => {
			const ok = utils.testStrictObject(each) &&
				("path" in (each as O) && typeof (each as O).path === "string") && // each.path
				("props" in (each as O) && utils.testStrictObject((each as O).props))    // each.props
			return ok
		})
	return ok
}

////////////////////////////////////////////////////////////////////////////////

async function exportPage(runtime: types.Runtime, meta: types.RouteMeta, mod: PageModule): Promise<void> {
	let head = "<!-- <Head> -->"
	try {
		if (typeof mod.Head === "function") {
			const renderString = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, meta.props))
			head = renderString.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (err) {
		log.error(`${meta.route.src}.Head: ${err.message}`)
	}

	let page = `<noscript>You need to enable JavaScript to run this app.</noscript>
		<div id="root"></div>
		<script src="/app.js"></script>`
	try {
		if (typeof mod.default === "function") {
			const renderString = ReactDOMServer.renderToString(React.createElement(mod.default, meta.props))
			page = page.replace(`<div id="root"></div>`, `<div id="root">${renderString}</div>`)
		}
	} catch (err) {
		log.error(`${meta.route.src}.default: ${err.message}`)
	}

	// Export:
	const rendered = runtime.document.replace("%head%", head).replace("%page%", page)
	await fs.promises.mkdir(p.dirname(meta.route.dst), { recursive: true })
	await fs.promises.writeFile(meta.route.dst, rendered)
}

async function resolveStaticRouteMeta(
	runtime: types.Runtime<types.ExportCommand>,
	page: types.StaticPageMeta,
	outfile: string,
): Promise<types.RouteMeta> {
	let props: types.ServerResolvedProps = { path: page.path }

	// NOTE: Use try to suppress: warning: This call to "require" will not be
	// bundled because the argument is not a string literal (surround with a
	// try/catch to silence this warning).
	let mod: StaticPageModule
	try {
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverProps" in mod! && typeof mod.serverProps !== "function") {
		log.error(errServerPropsFunction(page.src))
	} else if ("serverPaths" in mod! && typeof (mod as { [key: string]: unknown }).serverPaths === "function") {
		log.error(errServerPathsMismatch(page.src))
	}

	// Resolve serverProps:
	if (typeof mod!.serverProps === "function") {
		try {
			const serverProps = await mod!.serverProps!()
			if (!testServerPropsReturn(serverProps)) {
				log.error(errServerPropsReturn(page.src))
			}
			props = {
				// @ts-ignore
				path: page.path, // Add path
				...serverProps,
			}
		} catch (err) {
			log.error(`${page.src}.serverProps: ${err.message}`)
		}
	}

	const meta = { route: page, props }
	await exportPage(runtime, meta, mod!)
	return meta
}

async function resolveDynamicRouteMetas(
	runtime: types.Runtime<types.ExportCommand>,
	page: types.PageMeta,
	outfile: string,
): Promise<types.RouteMeta[]> {
	const metas: types.RouteMeta[] = []

	// NOTE: Use try to suppress: warning: This call to "require" will not be
	// bundled because the argument is not a string literal (surround with a
	// try/catch to silence this warning).
	let mod: DynamicPageModule
	try {
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverPaths" in mod! && typeof mod.serverPaths !== "function") {
		log.error(errServerPathsFunction(page.src))
	} else if ("serverProps" in mod! && typeof (mod as { [key: string]: unknown }).serverProps === "function") {
		log.error(errServerPropsMismatch(page.src))
	}

	// Resolve serverPaths:
	if (typeof mod!.serverPaths === "function") {
		let paths: { path: string; props: types.Props }[] = []
		try {
			paths = await mod!.serverPaths!()
			if (!testServerPathsReturn(paths)) {
				log.error(errServerPathsReturn(page.src))
			}
		} catch (err) {
			log.error(`${page.src}.serverPaths: ${err.message}`)
		}

		for (const path of paths) {
			const path_ = p.join(p.dirname(page.src).slice(runtime.directories.srcPagesDir.length), path.path)
			const dst = p.join(runtime.directories.exportDir, path_ + ".html")
			metas.push({
				route: {
					type: "dynamic",
					src: page.src,
					dst,
					path: path_,
					component: page.component,
				},
				props: {
					path: path_, // Add path
					...path.props,
				},
			})
		}
	}

	for (const meta of metas) {
		await exportPage(runtime, meta, mod!)
	}
	return metas
}

let once = false

// resolveServerRouter exports pages and resolves the server router; resolves
// mod.serverProps and mod.serverPaths.
async function resolveServerRouter(runtime: types.Runtime<types.ExportCommand>): Promise<types.Router> {
	const router: types.Router = {}

	// TODO: Add --concurrent?
	const service = await esbuild.startService()
	for (const page of runtime.pages) {
		// Generate paths for esbuild:
		const entryPoints = [page.src]
		const outfile = p.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"))

		// let result: esbuild.BuildResult
		try {
			// Use external: ["react", "react-dom"] to prevent a React error: You
			// might have mismatching versions of React and the renderer (such as
			// React DOM).
			const result = await service.build({
				bundle: true,
				define: {
					__DEV__: process.env.__DEV__!,
					"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV!),
				},
				entryPoints,
				external: ["react", "react-dom"],
				format: "cjs", // Node.js
				inject: ["packages/retro/react-shim.js"],
				loader: { ".js": "jsx" },
				logLevel: "silent", // TODO
				outfile,
				// plugins: [...configs.retro.plugins], // TODO
			})
			// TODO: Add support for hints.
			if (result.warnings.length > 0) {
				for (const warning of result.warnings) {
					log.warning(utils.formatEsbuildMessage(warning, term.yellow))
				}
				process.exit(1)
			}
		} catch (err) {
			log.error(utils.formatEsbuildMessage((err as esbuild.BuildFailure).errors[0]!, term.bold.red))
			// log.error(utils.formatEsbuildMessage(result.error, term.red))
			// log.error(JSON.stringify(err))
			// log.error(err)
			// process.exit(1)
		}

		let start = Date.now()

		// Resolve static page:
		if (page.type === "static") {
			const meta = await resolveStaticRouteMeta(runtime, page, outfile)
			if (router[meta.route.path] !== undefined) {
				log.error(errPathExists(meta.route, router[meta.route.path]!.route))
			}
			router[meta.route.path] = meta

			if (!once) {
				console.log()
				once = true
			}
			loggers.exportEvent(runtime, meta, start)
		}

		// Resolve dynamic pages:
		if (page.type === "dynamic") {
			const metas = await resolveDynamicRouteMetas(runtime, page, outfile)

			for (const meta of metas) {
				// start = Date.now()

				if (router[meta.route.path] !== undefined) {
					log.error(errPathExists(meta.route, router[meta.route.path]!.route))
				}
				router[meta.route.path] = meta

				if (!once) {
					console.log()
					once = true
				}
				loggers.exportEvent(runtime, meta, start)
				start = 0 // No-op
			}
		}
	}
	console.log()

	return router
}

function prettyJSON(str: string): string {
	return str.replace(/^{"/, `{ "`).replace(/":"/g, `": "`).replace(/","/g, `", "`).replace(/"}$/, `" }`)
}

// renderAppSource renders the app source code; depends on the server router.
//
// TODO: Write tests (pure function).
export async function renderAppSource(
	runtime: types.Runtime<types.ExportCommand>,
	router: types.Router,
): Promise<string> {
	const distinctComponents = [...new Set(runtime.pages.map(each => each.component))] // TODO: Change to router?

	const distinctRoutes = runtime.pages
		.filter(route => distinctComponents.includes(route.component))
		.sort((a, b) => a.component.localeCompare(b.component))

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${distinctRoutes.map(route => `import ${route.component} from "../${route.src}"`).join("\n")}

export default function App() {
	return (
		<Router>
${
	Object.entries(router)
		.map(
			([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component}
					{...${prettyJSON(JSON.stringify(meta.props))}
				} />
			</Route>`,
		)
		.join("\n") + "\n"
}
		</Router>
	)
}

${
	JSON.parse(process.env.STRICT_MODE || "true")
		? `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)`
		: `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<App />,
	document.getElementById("root"),
)`
}
`
}

const cmd_export: types.cmd_export = async runtime => {
	await runServerGuards(runtime.directories)
	const data = await fs.promises.readFile(p.join(runtime.directories.publicDir, "index.html"))
	runtime.document = data.toString()
	runtime.pages = await parsePages(runtime.directories)

	const router = await resolveServerRouter(runtime)

	// // TODO: Cache the router for renderAppSource?
	// console.log(router)

	const appSource = await renderAppSource(runtime, router)
	const appSourcePath = p.join(runtime.directories.cacheDir, "app.js")
	await fs.promises.writeFile(appSourcePath, appSource)

	// Generate paths for esbuild:
	const entryPoints = [appSourcePath]
	const outfile = p.join(runtime.directories.exportDir, appSourcePath.slice(runtime.directories.srcPagesDir.length))

	try {
		const result = await esbuild.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			},
			entryPoints,
			// external: ["react", "react-dom"],
			format: "iife", // DOM
			inject: ["packages/retro/react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			minify: true,
			outfile,
			// plugins: [...configs.retro.plugins], // TODO
		})
		// TODO: Add support for hints.
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(utils.formatEsbuildMessage(warning, term.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		log.error(err)
		process.exit(1)
	}
}

export default cmd_export
