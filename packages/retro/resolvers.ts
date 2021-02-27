import * as errs from "./errs"
import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as loggers from "./utils/logTypes"
import * as p from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

////////////////////////////////////////////////////////////////////////////////

type renderToString = (runtime: types.Runtime, meta: types.ServerRouteMeta, mod: types.PageModule) => Promise<void>

export const renderToString: renderToString = async (runtime, meta, mod) => {
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

////////////////////////////////////////////////////////////////////////////////

type resolveStaticRouteMeta = (
	runtime: types.Runtime<types.ExportCommand>,
	page: types.StaticPageMeta,
	outfile: string,
) => Promise<types.ServerRouteMeta>

const resolveStaticRouteMeta: resolveStaticRouteMeta = async (runtime, page, outfile) => {
	let props: types.ServerResolvedProps = { path: page.path }

	// NOTE: Use try to suppress: warning: This call to "require" will not be
	// bundled because the argument is not a string literal (surround with a
	// try/catch to silence this warning).
	let mod: types.StaticPageModule
	try {
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverProps" in mod! && typeof mod.serverProps !== "function") {
		log.error(errs.serverPropsFunction(page.src))
	} else if ("serverPaths" in mod! && typeof (mod as { [key: string]: unknown }).serverPaths === "function") {
		log.error(errs.serverPathsMismatch(page.src))
	}

	// Resolve serverProps:
	if (typeof mod!.serverProps === "function") {
		try {
			const serverProps = await mod!.serverProps!()
			if (!utils.validateServerPropsReturn(serverProps)) {
				log.error(errs.serverPropsReturn(page.src))
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
	await renderToString(runtime, meta, mod!)
	return meta
}

////////////////////////////////////////////////////////////////////////////////

type resolveDynamicRouteMetas = (
	runtime: types.Runtime<types.ExportCommand>,
	page: types.PageMeta,
	outfile: string,
) => Promise<types.ServerRouteMeta[]>

const resolveDynamicRouteMetas: resolveDynamicRouteMetas = async (runtime, page, outfile) => {
	const metas: types.ServerRouteMeta[] = []

	// NOTE: Use try to suppress: warning: This call to "require" will not be
	// bundled because the argument is not a string literal (surround with a
	// try/catch to silence this warning).
	let mod: types.DynamicPageModule
	try {
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverPaths" in mod! && typeof mod.serverPaths !== "function") {
		log.error(errs.serverPathsFunction(page.src))
	} else if ("serverProps" in mod! && typeof (mod as { [key: string]: unknown }).serverProps === "function") {
		log.error(errs.serverPropsMismatch(page.src))
	}

	// Resolve serverPaths:
	if (typeof mod!.serverPaths === "function") {
		let paths: { path: string; props: types.Props }[] = []
		try {
			paths = await mod!.serverPaths!()
			if (!utils.validateServerPathsReturn(paths)) {
				log.error(errs.serverPathsReturn(page.src))
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
		await renderToString(runtime, meta, mod!)
	}
	return metas
}

let once = false

////////////////////////////////////////////////////////////////////////////////

type resolveServerRouter = (runtime: types.Runtime<types.ExportCommand>) => Promise<types.ServerRouter>

// resolveServerRouter exports pages and resolves the server router; resolves
// mod.serverProps and mod.serverPaths.
export const resolveServerRouter: resolveServerRouter = async runtime => {
	const router: types.ServerRouter = {}

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
			// TODO: How do we differentiate esbuild errors from general errors?
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
				log.error(errs.duplicatePathFound(meta.route, router[meta.route.path]!.route))
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
					log.error(errs.duplicatePathFound(meta.route, router[meta.route.path]!.route))
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

////////////////////////////////////////////////////////////////////////////////

type renderServerRouterToString = (
	runtime: types.Runtime<types.ExportCommand>,
	router: types.ServerRouter,
) => Promise<string>

// TODO: Write tests (pure function).
export const renderServerRouterToString: renderServerRouterToString = async (runtime, router) => {
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
					{...${utils.prettyJSON(JSON.stringify(meta.props))}
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
