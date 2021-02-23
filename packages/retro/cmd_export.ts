// import * as esbuild from "esbuild"
// import * as fs from "fs"
// import * as p from "path"
// import * as React from "react"
// import * as ReactDOMServer from "react-dom/server"
// import * as term from "../lib/term"

import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as term from "../lib/term"
import * as types from "./types"

import parsePages from "./parsePages"
import runServerGuards from "./runServerGuards"

////////////////////////////////////////////////////////////////////////////////

function errServerPropsFunction(src: string): string {
	return `${src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
function serverProps() {
	return { ... }
}

// Asynchronous:
async function serverProps() {
	await ...
	return { ... }
}`
}

function errServerPathsFunction(src: string): string {
	return `${src}: 'typeof serverPaths !== "function"'; 'serverPaths' must be a synchronous or an asynchronous function.

For example:

// Synchronous:
function serverPaths() {
	return { ... }
}

// Asynchronous:
async function serverPaths() {
	await ...
	return { ... }
}`
}

function errServerPropsMismatch(src: string): string {
	return `${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

function serverPaths() {
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

function serverProps() {
	return { ... }
}`
}

// TODO
function errServerPathsReturn(src: string): string {
	return `${src}: 'typeof props !== "object"'; 'serverProps' must return an object.

For example:

function serverProps() {
	return { ... }
}`
}

function errServerPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use 'serverProps' not 'serverPaths'.

For example:

function serverProps() {
	return { ... }
}`
}

function errPathExists(r1: ServerRoute, r2: ServerRoute) {
	return `${r1.src}: Path '${r1.path}' is already being used by ${r2.src}.`
}

////////////////////////////////////////////////////////////////////////////////

// // RenderPayload describes a render payload (page metadata).
// interface RenderPayload {
// 	outputPath: string
// 	path: string
// 	module: types.StaticPageModule | types.DynamicPageModule
// 	props?: types.DescriptiveServerProps
// }
//
// // "/" -> "/index.html"
// // "/nested/" -> "/nested/index.html"
// function pathToHTML(path: string): string {
// 	if (!path.endsWith("/")) return path + ".html"
// 	return path + "index.html"
// }
//
// // exportPage exports a page.
// async function exportPage(runtime: types.Runtime, render: RenderPayload): Promise<void> {
// 	// Render head:
// 	let head = "<!-- <Head> -->"
// 	if (typeof render.module.Head === "function") {
// 		const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(render.module.Head, render.props))
// 		head = markup.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
// 	}
//
// 	// Render page:
// 	let page = `
// 		<noscript>You need to enable JavaScript to run this app.</noscript>
// 		<div id="root"></div>
// 		<script src="/app.js"></script>
// 	`.trim()
//
// 	// prettier-ignore
// 	if (typeof render.module.default === "function") {
// 		const str = ReactDOMServer.renderToString(React.createElement(render.module.default, render.props))
// 		page = page.replace(
// 			`<div id="root"></div>`,
// 			`<div id="root">${str}</div>`,
// 		)
// 	}
//
// 	// prettier-ignore
// 	const data = runtime.baseHTML
// 		.replace("%head%", head)
// 		.replace("%page%", page)
//
// 	// Export:
// 	await fs.promises.mkdir(p.dirname(render.outputPath), { recursive: true })
// 	await fs.promises.writeFile(render.outputPath, data)
// }

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
	const ok = typeof value === "object" &&
		value !== null &&
		!Array.isArray(value)
	return ok
}

// TODO
// prettier-ignore
function testServerPathsReturn(value: unknown): boolean {
	return true

	// const ok = typeof value === "object" &&
	// 	value !== null &&
	// 	!Array.isArray(value)
	// return ok
}

////////////////////////////////////////////////////////////////////////////////

async function resolveStaticRouteMeta(
	_: types.Runtime<types.ExportCommand>,
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
			// Do not overwrite path:
			props = { ...props, ...serverProps }
		} catch (err) {
			log.error(`${page.src}.serverProps: ${err.message}`)
		}
	}
	const route = page
	return { route, props }
}

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
		try {
			const paths = await mod!.serverPaths!()
			if (!testServerPathsReturn(paths)) {
				log.error(errServerPathsReturn(page.src))
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
		} catch (err) {
			log.error(`${page.src}.serverPaths: ${err.message}`)
		}
	}
	return metas

	//	if (typeof mod.serverPaths === "function") {
	//		const descriptSrvPaths: types.DescriptiveServerPaths = await mod.serverPaths(descriptSrvProps)
	//
	//		// Generate a component router:
	//		const compRouter: types.ServerRouter = {}
	//		for (const { path, props } of descriptSrvPaths) {
	//			compRouter[path] = {
	//				route,
	//				props: {
	//					path,
	//					...props,
	//				},
	//			}
	//		}
	//
	//		for (const [path, { props }] of Object.entries(compRouter)) {
	//			// Merge the component router to the app router:
	//			//
	//			// TODO: Warn here for repeat paths.
	//			router[path] = { route, props }
	//
	//			// Create a renderPayload for exportPage:
	//			const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
	//			const render: RenderPayload = {
	//				outputPath,
	//				path,
	//				module: mod,
	//				props,
	//			}
	//			await exportPage(runtime, render)
	//		}
	//		continue
	//	}
	//	// Merge the route to the app router:
	//	//
	//	// TODO: Warn here for repeat paths.
	//	const path = route.path
	//	router[path] = { route, props: descriptSrvProps }
	//
	//	// Create a renderPayload for exportPage:
	//	const outputPath = p.join(runtime.directoryConfiguration.exportDir, pathToHTML(path))
	//	const render: RenderPayload = {
	//		outputPath,
	//		path,
	//		module: mod,
	//		props: descriptSrvProps,
	//	}
	//	await exportPage(runtime, render)
}

// resolveServerRouter exports pages and resolves the server router; resolves
// mod.serverProps and mod.serverPaths.
async function resolveServerRouter(runtime: types.Runtime<types.ExportCommand>): Promise<ServerResolvedRouter> {
	const router: ServerResolvedRouter = {}

	// TODO: Add --concurrent?
	const service = await esbuild.startService()
	for (const page of runtime.pages) {
		// Generate paths for esbuild:
		const entryPoints = [page.src]
		const outfile = p.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"))

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
		// TODO: Emit warnings here.
		// console.log(result)

		// Resolve static page:
		if (page.type === "static") {
			const d1 = Date.now()
			const meta = await resolveStaticRouteMeta(runtime, page, outfile)
			if (router[meta.route.path] !== undefined) {
				log.error(errPathExists(meta.route, router[meta.route.path]!.route))
			}
			router[meta.route.path] = meta
			const d2 = Date.now()
			console.log(`  ${term.green(`${meta.route.src} -> ${meta.route.dst} (${d2 - d1}ms)`)}`)
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
				console.log(`  ${term.teal(`${meta.route.src} -> ${meta.route.dst} (${d2 - d1}ms)`)}`)
			}
		}
	}

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
