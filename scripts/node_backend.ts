import * as esbuild from "esbuild"
import * as path from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as T from "./types"
import { readline, stderr, stdout } from "./utils"
import { newPathInfo, PathInfo } from "./newPathInfo"

const modCache: { [key: string]: T.AnyModule } = {}

////////////////////////////////////////////////////////////////////////////////

const transpile = (source: string, target: string): esbuild.BuildOptions => ({
	bundle: true,
	color: true,
	define: {
		__DEV__: JSON.stringify(process.env["NODE_ENV"] === "true"),
		"process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"] ?? "development"),
	},
	entryPoints: [source],
	external: ["react", "react-dom"], // Dedupe React APIs
	format: "cjs",
	inject: ["scripts/react-shim.js"],
	loader: {
		".js": "jsx", // Process .js as .jsx
	},
	logLevel: "warning",
	minify: false,
	outfile: target,
	// plugins: [...],
})

const bundle = (source: string, target: string): esbuild.BuildOptions => ({
	bundle: true,
	color: true,
	define: {
		__DEV__: JSON.stringify(process.env["NODE_ENV"] === "true"),
		"process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"] ?? "development"),
	},
	entryPoints: [source],
	external: [],
	format: "iife",
	inject: ["scripts/react-shim.js"],
	loader: {
		".js": "jsx", // Process .js as .jsx
	},
	logLevel: "warning",
	minify: true,
	outfile: target,
	// plugins: [...],
})

////////////////////////////////////////////////////////////////////////////////

async function resolveModule<Module extends T.AnyModule>(runtime: T.Runtime, route: T.Route): Promise<Module> {
	const source = route.Source
	const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"))

	await esbuild.build(transpile(source, target))

	// // try {
	// mod = require(path.resolve(target))
	// // } catch (error) {
	// // 	throw error
	// // }

	// Purge the cache
	delete require.cache[path.resolve(target)]
	const mod = require(path.resolve(target))
	return mod
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
	const mod = await resolveModule<T.StaticModule>(runtime, route)
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
	modCache[srvRoute.Route.Pathname] = mod
	return srvRoute
}

async function resolveDynamicServerRoutes(runtime: T.Runtime, route: T.Route): Promise<T.ServerRoute[]> {
	const mod = await resolveModule<T.DynamicModule>(runtime, route)
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
		modCache[srvRoute.Route.Pathname] = mod
		srvRoutes.push(srvRoute)
	}
	return srvRoutes
}

async function resolveRouter(runtime: T.Runtime): Promise<T.ServerRouter> {
	let once = false
	function start() {
		if (!once) {
			stdout({ Kind: "start" })
			once = true
		}
	}

	const router: T.ServerRouter = {}
	for (const route of runtime.Routes) {
		if (route.Type === "static") {
			start()
			const srvRoute = await resolveStaticServerRoute(runtime, route)
			// if (router[meta.route.path] !== undefined) {
			// 	throw new Error(errors.repeatPath(meta.route, router[meta.route.path]!.route))
			// }
			stdout({ Kind: "server_route", Data: srvRoute })
			router[srvRoute.Route.Pathname] = srvRoute
		} else if (route.Type === "dynamic") {
			start()
			const srvRoutes = await resolveDynamicServerRoutes(runtime, route)
			for (const srvRoute of srvRoutes) {
				// if (router[meta.route.path] !== undefined) {
				// 	throw new Error(errors.repeatPath(meta.route, router[meta.route.path]!.route))
				// }
				stdout({ Kind: "server_route", Data: srvRoute })
				router[srvRoute.Route.Pathname] = srvRoute
			}
		}
	}
	return router
}

interface ServerRouteContents {
	Head: string
	Body: string
}

async function serverRouteContents(runtime: T.Runtime, srvRoute: T.ServerRoute): Promise<ServerRouteContents> {
	const mod = await resolveModule(runtime, srvRoute.Route)

	let head = "<!-- <Head> -->"
	try {
		if (typeof mod.Head === "function") {
			const str = ReactDOMServer.renderToStaticMarkup(React.createElement(mod.Head, srvRoute.Props))
			head = str.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (error) {
		// log.fatal(`${srvRoute.Route.Source}.<Head>: ${error.message}`)
	}

	// TODO: Upgrade to <script src="/app.[hash].js">?
	let body = ""
	body += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	body += `\n\t\t<div id="root"></div>`
	body += `\n\t\t<script src="/app.js"></script>`
	body += `\n\t\t<script type="module">const dev = new EventSource("/~dev"); dev.addEventListener("reload", e => void window.location.reload()); dev.addEventListener("error", e => void console.error(JSON.parse(e.data)))</script>`

	// app += !true ? "" : `\n\t\t<script type="module">`
	// app += !true ? "" : `\n\t\t\tconst dev = new EventSource("/~dev")`
	// app += !true ? "" : `\n\t\t\tdev.addEventListener("reload", e => {`
	// app += !true ? "" : `\n\t\t\t\twindow.location.reload()`
	// app += !true ? "" : `\n\t\t\t})`
	// app += !true ? "" : `\n\t\t\tdev.addEventListener("error", e => {`
	// app += !true ? "" : `\n\t\t\t\tconsole.error(JSON.parse(e.data))`
	// app += !true ? "" : `\n\t\t\t})`
	// app += !true ? "" : `\n\t\t</script>`

	try {
		// prettier-ignore
		body = body.replace(
			`<div id="root"></div>`,
			`<div id="root">` +
				ReactDOMServer.renderToString(
					React.createElement(mod.default, srvRoute.Props),
				) +
			`</div>`,
		)
	} catch (error) {
		// if (!(process.env["__DEV__"] === "true")) log.fatal(`${srvRoute.Route.Source}.<Page>: ${error.message}`)
		// if (process.env["__DEV__"] === "true") throw error
	}

	const contents: ServerRouteContents = { Head: head, Body: body }
	return contents
}

function serverRouterContents(srvRouter: T.ServerRouter): string {
	const distinctImportsMap = new Map<string, string>()
	for (const srvRoute of Object.values(srvRouter)) {
		distinctImportsMap.set(srvRoute.Route.ComponentName, srvRoute.Route.Source)
	}

	const distinctImports = Array.from(distinctImportsMap)
	distinctImports.sort()

	return `import React from "react"
import ReactDOM from "react-dom"

${distinctImports.map(([componentName, source]) => `import ${componentName} from "../${source}"`).join("\n")}

import { Route, Router } from "../npm/router"

export default function App() {
	return (
		<Router>
${
	Object.entries(srvRouter)
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

async function startDevServer(runtime: T.Runtime): Promise<void> {
	const source = path.join(runtime.Dirs.CacheDir, "app.js")
	const target = path.join(runtime.Dirs.ExportDir, "app.js")

	let buildResult: esbuild.BuildResult
	let buildError: Error

	try {
		buildResult = await esbuild.build({
			...bundle(source, target),
			incremental: true,
			watch: {
				async onRebuild(rebuildFailure) {
					stdout({
						Kind: "rebuild",
						Data: rebuildFailure,
					})
				},
			},
		})
	} catch (error) {
		buildError = error
	}

	stdout({
		Kind: "build",
		Data: { ...buildError!, ...buildResult! },
	})
}

async function main(): Promise<void> {
	// Warm up esbuild
	esbuild.build({})

	while (true) {
		const encoded = await readline()
		const msg: T.Message = JSON.parse(encoded)
		switch (msg.Kind) {
			case "resolve_server_router": {
				const router = await resolveRouter(msg.Data)
				stdout({ Kind: "server_router", Data: router })
				stdout({ Kind: "eof" })
				break
			}
			case "server_route_contents": {
				const contents = await serverRouteContents(msg.Data.Runtime, msg.Data.SrvRoute)
				stdout({ Kind: "server_route_contents", Data: contents })
				break
			}
			case "server_router_contents": {
				const contents = serverRouterContents(msg.Data)
				stdout({ Kind: "server_router_contents", Data: contents })
				break
			}
			case "start_dev_server": {
				await startDevServer(msg.Data)
				break
			}
			case "done": {
				return
			}
			default: {
				throw new Error("Internal error")
			}
		}
	}
}

main()
