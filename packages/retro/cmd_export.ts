import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"
import * as utils from "./utils"

import chalk from "chalk"
import parsePages from "./parsePages"
import runServerGuards from "./runServerGuards"

////////////////////////////////////////////////////////////////////////////////

function errServerPropsFunction(src: string): string {
	return `${src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
export function serverProps() {
	return { ... }
}

// Asynchronous:
export async function serverProps() {
	await ...
	return { ... }
}`
}

function errServerPathsFunction(src: string): string {
	return `${src}: 'typeof serverPaths !== "function"'; 'serverPaths' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
export function serverPaths() {
	return { ... }
}

// Asynchronous:
export async function serverPaths() {
	await ...
	return { ... }
}`
}

function errServerPropsMismatch(src: string): string {
	return `${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

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
	return `${src}: 'typeof props !== "object"'; 'serverProps' must return an object.

For example:

export function serverProps() {
	return { ... }
}`
}

// TODO
function errServerPathsReturn(src: string): string {
	return `${src}: 'typeof props !== "object"'; 'serverProps' must return an object.

For example:

export function serverProps() {
	return { ... }
}`
}

function errServerPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use 'serverProps' not 'serverPaths'.

For example:

export function serverProps() {
	return { ... }
}`
}

function errPathExists(r1: ServerRoute, r2: ServerRoute): string {
	return `${r1.src}: Path '${r1.path}' is already being used by ${r2.src}.`
}

////////////////////////////////////////////////////////////////////////////////

// Props describes runtime props.
type Props = { [key: string]: unknown }

// DescriptServerProps describes runtime props resolved on the server.
type ServerResolvedProps = Props & { path: string }

// PageModule ambiguously describes a page module.
interface PageModule {
	Head?: (props: ServerResolvedProps) => JSX.Element
	default?: (props: ServerResolvedProps) => JSX.Element
}

// StaticPageModule describes a static page module.
interface StaticPageModule extends PageModule {
	serverProps?(): Promise<ServerResolvedProps>
}

// DynamicPageModule describes a dynamic page module.
interface DynamicPageModule extends PageModule {
	serverPaths(): Promise<{ path: string; props: Props }[]>
}

// prettier-ignore
interface ServerRoute {
	type:      "static" | "dynamic"
	src:       string // e.g. "src/pages/index.js"
	dst:       string // e.g. "dst/index.html"
	path:      string // e.g. "/"
	component: string // e.g. "PageIndex"
}

interface ServerRouteMeta {
	route: ServerRoute
	props: ServerResolvedProps
}

interface ServerResolvedRouter {
	[key: string]: ServerRouteMeta
}

////////////////////////////////////////////////////////////////////////////////

// Based on https://github.com/evanw/esbuild/blob/master/lib/common.ts#L35.
// prettier-ignore
function testServerPropsReturn(value: unknown): boolean {
	return utils.testObject(value)
}

// prettier-ignore
function testServerPathsReturn(value: unknown): boolean {
	type A = unknown[]
	type O = { [key: string]: unknown }

	const ok = utils.testArray(value) &&
		(value as A).every(each => {
			const ok = utils.testObject(each) &&
				("path" in (each as O) && typeof (each as O).path === "string") && // each.path
				("props" in (each as O) && utils.testObject((each as O).props))    // each.props
			return ok
		})
	return ok
}

////////////////////////////////////////////////////////////////////////////////

// exportPage exports a page.
async function exportPage(runtime: types.Runtime, meta: ServerRouteMeta, mod: PageModule): Promise<void> {
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
		<div id="root"></div>`
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
): Promise<ServerRouteMeta> {
	let props: ServerResolvedProps = { path: page.path }

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
	await exportPage(runtime, meta, mod)
	return meta
}

// // Create a renderPayload for exportPage:
// const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
// const render: RenderPayload = {
// 	outputPath,
// 	path,
// 	module: mod,
// 	props: descriptSrvProps,
// }
// await exportPage(runtime, render)

async function resolveDynamicRouteMetas(
	runtime: types.Runtime<types.ExportCommand>,
	page: types.PageMeta,
	outfile: string,
): Promise<ServerRouteMeta[]> {
	const metas: ServerRouteMeta[] = []

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
		let paths: { path: string; props: Props }[] = []

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
			// ...
		}
	}
	return metas
}

// for (const [path, { props }] of Object.entries(compRouter)) {
// 	// Merge the component router to the app router:
// 	//
// 	// TODO: Warn here for repeat paths.
// 	router[path] = { route, props }
//
// 	// Create a renderPayload for exportPage:
// 	const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
// 	const render: RenderPayload = {
// 		outputPath,
// 		path,
// 		module: mod,
// 		props,
// 	}
// 	await exportPage(runtime, render)
// }

// resolveServerRouter exports pages and resolves the server router; resolves
// mod.serverProps and mod.serverPaths.
async function resolveServerRouter(runtime: types.Runtime<types.ExportCommand>): Promise<ServerResolvedRouter> {
	const router: ServerResolvedRouter = {}

	// TODO: Add --concurrent?
	console.log() // "\n"
	const service = await esbuild.startService()
	for (const page of runtime.pages) {
		// Generate paths for esbuild:
		const entryPoints = [page.src]
		const outfile = p.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"))

		try {
			// Use external: ["react", "react-dom"] to prevent a React error: You might
			// have mismatching versions of React and the renderer (such as React DOM).
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
					log.warning(utils.formatMessage(warning, chalk.yellow))
				}
				process.exit(1)
			}
		} catch (err) {
			log.error(err)
			process.exit(1)
		}

		// Resolve static page:
		if (page.type === "static") {
			const d1 = Date.now()
			const meta = await resolveStaticRouteMeta(runtime, page, outfile)
			if (router[meta.route.path] !== undefined) {
				log.error(errPathExists(meta.route, router[meta.route.path]!.route))
			}
			router[meta.route.path] = meta
			const d2 = Date.now()
			const sep = chalk.gray("-".repeat(Math.max(0, 37 - meta.route.src.length)))
			console.log(`${" ".repeat(2)}${chalk.green(`${meta.route.src} ${sep} ${meta.route.dst} (${d2 - d1}ms)`)}`)
		}

		// Resolve dynamic pages:
		if (page.type === "dynamic") {
			const d1 = Date.now()
			const metas = await resolveDynamicRouteMetas(runtime, page, outfile)
			for (const meta of metas) {
				if (router[meta.route.path] !== undefined) {
					log.error(errPathExists(meta.route, router[meta.route.path]!.route))
				}
				router[meta.route.path] = meta
				const d2 = Date.now()
				const sep = chalk.gray("-".repeat(Math.max(0, 37 - meta.route.src.length)))
				console.log(`${" ".repeat(2)}${chalk.cyan(`${meta.route.src} ${sep} ${meta.route.dst} (${d2 - d1}ms)`)}`)
			}
		}
	}

	console.log() // "\n"
	return router
}

// // renderAppSource renders the app source code (before esbuild).
// //
// // TODO: Write tests (pure function).
// export async function renderAppSource(runtime: types.Runtime<types.ExportCommand>): Promise<string> {
// 	const componentKeys = [...new Set(runtime.routes.map(each => each.component))]
//
// 	const sharedRoutes = runtime.routes
// 		.filter(route => componentKeys.includes(route.component))
// 		.sort((a, b) => a.component.localeCompare(b.component))
//
// 	console.log(`import React from "react"
// import ReactDOM from "react-dom"
// import { Route, Router } from "../router"
//
// // Shared components
// ${sharedRoutes.map(route => `import ${route.component} from "../${route.src}"`).join("\n")}
//
// // Server router
// import router from "./router.json"
// `)
//
// 	// 	return `import React from "react"
// 	// import ReactDOM from "react-dom"
// 	// import { Route, Router } from "../router"
// 	// // Shared components
// 	// ${sharedComponents.map(component => `import ${component} from "../${route.inputPath}"`).join("\n")}
// 	// import router from "./router.json"
// 	// export default function App() {
// 	// 	return (
// 	// 		<Router>
// 	// ${
// 	// 	Object.entries(router)
// 	// 		.map(
// 	// 			([path, meta]) => `
// 	// 			<Route path="${path}">
// 	// 				<${meta.route.component} {
// 	// 					...router["${path}"].props
// 	// 				} />
// 	// 			</Route>`,
// 	// 		)
// 	// 		.join("\n") + "\n"
// 	// }
// 	// 		</Router>
// 	// 	)
// 	// }
// 	// ${
// 	// 	JSON.parse(process.env.STRICT_MODE || "true")
// 	// 		? `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
// 	// 	<React.StrictMode>
// 	// 		<App />
// 	// 	</React.StrictMode>,
// 	// 	document.getElementById("root"),
// 	// )`
// 	// 		: `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
// 	// 	<App />,
// 	// 	document.getElementById("root"),
// 	// )`
// 	// }
// 	// `
//
// 	return "TODO"
// }

const cmd_export: types.cmd_export = async runtime => {
	await runServerGuards(runtime.directories)
	const data = await fs.promises.readFile(p.join(runtime.directories.publicDir, "index.html"))
	runtime.document = data.toString()
	runtime.pages = await parsePages(runtime.directories)

	resolveServerRouter(runtime)
	// const router =

	// const appSource =
	// await renderAppSource(runtime)
	// console.log(appSource)

	// const appSourcePath = p.join(runtime.directoryConfiguration.cacheDir, "app.js")
	// await fs.promises.writeFile(appSourcePath, appSource)
	//
	// // Generate paths for esbuild:
	// const entryPoints = [appSourcePath]
	// const outfile = entryPoints[0]!.replace(
	// 	new RegExp("^" + runtime.directoryConfiguration.cacheDir.replace("/", "\\/")),
	// 	runtime.directoryConfiguration.exportDir,
	// )
	//
	// await esbuild.build({
	// 	bundle: true,
	// 	define: {
	// 		__DEV__: process.env.__DEV__!,
	// 		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	// 	},
	// 	entryPoints,
	// 	format: "iife", // DOM
	// 	inject: ["scripts/react-shim.js"],
	// 	loader: { ".js": "jsx" },
	// 	logLevel: "silent", // TODO
	// 	minify: true,
	// 	outfile,
	// 	// TODO: We should probably only need to resolve plugins once.
	// 	// plugins: [...configs.retro.plugins],
	// })
	// // TODO: Handle warnings, error, and hints.
}

export default cmd_export

// ;(async () => {
// 	try {
// 		await run(require("../__cache__/runtime.json"))
// 	} catch (error) {
// 		console.error(error.stack)
// 	}
// })()
