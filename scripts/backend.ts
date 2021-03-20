import * as esbuild from "esbuild"
import * as path from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as T from "./types"
import { newPathInfo, PathInfo } from "./path_info"
import { readline, stderr, stdout } from "./readline"

const baseOptions: esbuild.BuildOptions = {
	bundle: true,
	color: true,
	define: {
		__DEV__: "true",
		"process.env.NODE_ENV": JSON.stringify("development"),
	},
	inject: ["scripts/react_shim.js"],
	loader: {
		".js": "jsx",
	},
	// sourcemap: true,
}

// const modCache: { [key: string]: T.AnyModule } = {}

////////////////////////////////////////////////////////////////////////////////

// const transpile = (source: string, target: string): esbuild.BuildOptions => ({
// 	bundle: true,
// 	define: {
// 		"process.env.NODE_ENV": '"development"',
// 	},
// 	entryPoints: [source],
// 	external: ["react", "react-dom"], // Dedupe React APIs
// 	format: "cjs",
// 	loader: { ".js": "jsx" },
// 	logLevel: "warning",
// 	outfile: target,
// })

// const bundle = (source: string, target: string): esbuild.BuildOptions => ({
// 	bundle: true,
// 	define: {
// 		"process.env.NODE_ENV": '"development"',
// 	},
// 	entryPoints: [source],
// 	// external: [],
// 	format: "iife",
// 	loader: { ".js": "jsx" },
// 	logLevel: "warning",
// 	outfile: target,
// })

////////////////////////////////////////////////////////////////////////////////

async function resolveModule<Module extends T.AnyModule>(runtime: T.Runtime, source: string): Promise<Module> {
	const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"))

	try {
		// await esbuild.build(transpile(source, target))
		await esbuild.build({
			...baseOptions,
			entryPoints: [source],
			outfile: target,

			// Etc.
			external: ["react", "react-dom"], // Dedupe React APIs
			format: "cjs", // For require(...)
			// sourcemap: false,
		})
	} catch (error) {
		// Rethrow non-esbuild errors
		if (!("errors" in error) && !("warnings" in error)) {
			throw error
		}
	}

	// Use try-catch to no-op esbuild’s "require" warning
	let mod: Module
	try {
		// Purge the cache
		delete require.cache[path.resolve(target)]
		mod = require(path.resolve(target))
	} catch (error) {
		// Rethrow error
		throw error
	}

	return mod!
}

// src/pages/foo.html -> __export__/foo.html
function getTargetSyntax(dirs: T.Dirs, pathInfo: PathInfo): string {
	const str = path.join(
		dirs.ExportDir,
		pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length) + ".html",
	)
	return str
}

// src/pages/foo.html -> /foo
function getPathnameSyntax(dirs: T.Dirs, pathInfo: PathInfo): string {
	const str = pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length)
	if (str.endsWith("/index")) {
		return str.slice(0, -"index".length) // Keep "/"
	}
	return str
}

async function resolveStaticServerRoute(runtime: T.Runtime, route: T.Route): Promise<T.ServerRoute> {
	const mod = await resolveModule<T.StaticModule>(runtime, route.Source)
	// if (!valid.staticModuleExports(mod)) {
	// 	throw new Error(errors.badStaticPageExports(page.src))
	// }

	let props = {}
	if (typeof mod.serverProps === "function") {
		try {
			props = await mod.serverProps!()
			// if (!valid.serverPropsReturn(props)) {
			// 	throw new Error(errors.badServerPropsReturn(page.src))
			// }
		} catch (error) {
			// throw new Error(`${route.Source}.serverProps: ${error.message}`)
		}
	}

	const pathInfo = newPathInfo(route.Source)
	const target = getTargetSyntax(runtime.Dirs, pathInfo)
	const pathname = getPathnameSyntax(runtime.Dirs, pathInfo)

	const srvRoute: T.ServerRoute = {
		Route: {
			...route,
			Target: target,
			Pathname: pathname,
		},
		Props: {
			path: pathname, // Add path
			...props,
		},
	}

	// Cache
	// modCache[srvRoute.Route.Pathname] = mod
	return srvRoute
}

async function resolveDynamicServerRoutes(runtime: T.Runtime, route: T.Route): Promise<T.ServerRoute[]> {
	const mod = await resolveModule<T.DynamicModule>(runtime, route.Source)
	// if (!valid.dynamicModuleExports(mod)) {
	// 	throw new Error(errors.badDynamicPageExports(page.src))
	// }

	let paths: { path: string; props: T.Props }[] = []
	try {
		paths = await mod.serverPaths!()
		// if (!valid.serverPathsReturn(paths)) {
		// 	throw new Error(errors.badServerPathsReturn(page.src))
		// }
	} catch (error) {
		// throw new Error(`${page.src}.serverPaths: ${error.message}`)
	}

	const srvRoutes: T.ServerRoute[] = []
	for (const meta of paths) {
		// Compute pathname and target from meta.path (do not use getTargetSyntax or
		// getPathnameSyntax)
		const pathInfo = newPathInfo(route.Source)
		const pathname = path.join(pathInfo.dirname.slice(runtime.Dirs.SrcPagesDir.length), meta.path)
		const target = path.join(runtime.Dirs.ExportDir, pathname + ".html")

		const srvRoute: T.ServerRoute = {
			Route: {
				...route,
				Target: target,
				Pathname: pathname,
			},
			Props: {
				path: pathname, // Add path
				...meta.props,
			},
		}
		// Cache
		// modCache[srvRoute.Route.Pathname] = mod
		srvRoutes.push(srvRoute)
	}
	return srvRoutes
}

async function resolveServerRouter(runtime: T.Runtime): Promise<T.ServerRouter> {
	const srvRouter: T.ServerRouter = {}
	for (const [x, route] of runtime.Routes.entries()) {
		if (route.Type === "static") {
			if (x === 0) {
				stdout({ Kind: "once" })
			}
			const srvRoute = await resolveStaticServerRoute(runtime, route)
			// if (router[meta.route.path] !== undefined) {
			// 	throw new Error(errors.repeatPath(meta.route, router[meta.route.path]!.route))
			// }
			stdout({ Kind: "server_route", Data: srvRoute })
			srvRouter[srvRoute.Route.Pathname] = srvRoute
		} else if (route.Type === "dynamic") {
			if (x === 0) {
				stdout({ Kind: "once" })
			}
			const srvRoutes = await resolveDynamicServerRoutes(runtime, route)
			for (const srvRoute of srvRoutes) {
				// if (router[meta.route.path] !== undefined) {
				// 	throw new Error(errors.repeatPath(meta.route, router[meta.route.path]!.route))
				// }
				stdout({ Kind: "server_route", Data: srvRoute })
				srvRouter[srvRoute.Route.Pathname] = srvRoute
			}
		}
	}
	return srvRouter
}

interface serverRouteStringParams {
	Runtime: T.Runtime
	ServerRoute: T.ServerRoute
}

async function serverRouteString({ Runtime, ServerRoute }: serverRouteStringParams): Promise<string> {
	const mod = await resolveModule(Runtime, ServerRoute.Route.Source)

	let head = "<!-- <Head> -->"
	if (typeof mod.Head === "function") {
		head = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, ServerRoute.Props))
		head = head.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
	}

	let body = ""
	body += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	body += `\n\t\t<div id="root"></div>`
	body += `\n\t\t<script src="/app.js"></script>`
	body += `\n\t\t<script type="module">const dev = new EventSource("/~dev"); dev.addEventListener("reload", () => window.location.reload()); dev.addEventListener("error", e => { try { console.error(JSON.parse(e.data)) } catch {} })</script>`
	if (typeof mod.default === "function") {
		body = body.replace(
			`<div id="root"></div>`,
			`<div id="root">` + ReactDOMServer.renderToString(React.createElement(mod.default, ServerRoute.Props)) + `</div>`,
		)
	}

	let contents = Runtime.Template
	contents = contents.replace("%head%", head)
	contents = contents.replace("%body%", body)

	return contents
}

async function serverRouterString(runtime: T.Runtime): Promise<string> {
	const importMap = new Map<string, string>()
	for (const srvRoute of Object.values(runtime.SrvRouter)) {
		importMap.set(srvRoute.Route.ComponentName, srvRoute.Route.Source)
	}

	const imports = Array.from(importMap)
	imports.sort()

	return `import React from "react"
import ReactDOM from "react-dom"

${imports.map(([componentName, source]) => `import ${componentName} from "../${source}"`).join("\n")}

import { Route, Router } from "../npm/router"

export default function App() {
	return (
		<Router>
${
	Object.entries(runtime.SrvRouter)
		.map(
			([pathname, route]) => `
			<Route path="${pathname}">
				<${route.Route.ComponentName} {
					...${JSON.stringify(route.Props, null, "\t").replace(/\n\t?/g, " ")}
				} />
			</Route>`,
		)
		.join("\n") + "\n"
}
		</Router>
	)
}

ReactDOM.hydrate(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)
`
}

let incremental: esbuild.BuildIncremental

async function build(runtime: T.Runtime): Promise<any> {
	let errors: esbuild.Message[] = []
	let warnings: esbuild.Message[] = []

	const source = path.join(runtime.Dirs.CacheDir, "app.js")
	const target = path.join(runtime.Dirs.ExportDir, "app.js")

	try {
		// prettier-ignore
		incremental = await esbuild.build({
			...baseOptions,
			entryPoints: [source],
			outfile: target,

			// Etc.
			external: [],
			format: "iife",
			// sourcemap: true,

			// minify: true,
			// keepNames: true,

  		// minify?: boolean;
  		minifyWhitespace: true,
  		minifyIdentifiers: false,
  		minifySyntax: false,

			incremental: true,
		})
		warnings = incremental.warnings
	} catch (error) {
		// Rethrow non-esbuild errors
		if (!("errors" in error) && !("warnings" in error)) {
			throw error
		}
		warnings = error.warnings
		errors = error.errors
	}

	return { errors, warnings }
}

async function rebuild(): Promise<any> {
	let errors: esbuild.Message[] = []
	let warnings: esbuild.Message[] = []

	// Coerce to truthy
	if (incremental.rebuild === undefined) {
		throw new Error("Internal error")
	}

	try {
		const result = await incremental.rebuild!()
		warnings = result.warnings
	} catch (error) {
		// Rethrow non-esbuild errors
		if (!("errors" in error) && !("warnings" in error)) {
			throw error
		}
		warnings = error.warnings
		errors = error.errors
	}

	// const t = Date.now()
	// await incremental.rebuild!()
	// stderr(Date.now() - t)

	return { errors, warnings }
}

async function main(): Promise<void> {
	// Warm up esbuild
	esbuild.build({})

	while (true) {
		const encoded = await readline()
		const msg: T.Message = JSON.parse(encoded)
		switch (msg.Kind) {
			case "resolve_server_router":
				stdout({
					Kind: "done",
					Data: await resolveServerRouter(msg.Data),
				})
				break
			case "server_route_string":
				stdout({
					Kind: "",
					Data: await serverRouteString(msg.Data),
				})
				break
			case "server_router_string":
				stdout({
					Kind: "",
					Data: await serverRouterString(msg.Data),
				})
				break
			case "build":
				stdout({
					Kind: "",
					Data: await build(msg.Data),
				})
				break
			case "rebuild":
				stdout({
					Kind: "",
					Data: await rebuild(),
				})
				break
			default:
				throw new Error("Internal error")
		}
	}
}

main()
