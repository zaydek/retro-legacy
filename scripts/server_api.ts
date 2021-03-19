import * as esbuild from "esbuild"
import * as path from "path"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as T from "./types"
import { readline, stderr, stdout } from "./readline"
import { newPathInfo, PathInfo } from "./path_info"

const modCache: { [key: string]: T.AnyModule } = {}

async function resolveModule<Module extends T.AnyModule>(runtime: T.Runtime, route: T.Route): Promise<Module> {
	const source = route.Source
	const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"))

	// await esbuild.build(transpile(source, target))
	await esbuild.build({
		bundle: true,
		color: true,
		define: {
			__DEV__: JSON.stringify(process.env["NODE_ENV"] === "true"),
			"process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"] ?? "development"),
		},
		entryPoints: [source],
		external: ["react", "react-dom"], // Dedupe React APIs
		format: "cjs",
		inject: ["scripts/react_shim.js"],
		loader: {
			".js": "jsx", // Process .js as .jsx
		},
		logLevel: "warning",
		minify: false,
		outfile: target,
		// plugins: [...],
	})

	// Wrap try-catch to suppress esbuild warning
	let mod: Module
	try {
		// Purge the cache
		delete require.cache[path.resolve(target)]
		mod = require(path.resolve(target))
	} catch (error) {
		// Rethrow error
		throw error
	}
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

async function resolveServerRouter(runtime: T.Runtime): Promise<T.ServerRouter> {
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

async function main(): Promise<void> {
	// Warm up esbuild
	esbuild.build({})

	while (true) {
		const encoded = await readline()
		const msg: T.Message = JSON.parse(encoded)
		switch (msg.Kind) {
			case "resolve_server_router": {
				const srvRouter = await resolveServerRouter(msg.Data)
				stdout(JSON.stringify(srvRouter))
				return
			}
			default: {
				throw new Error("Internal error")
			}
		}
	}
}

main()
