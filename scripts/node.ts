import * as esbuild from "esbuild"
import * as path from "path"
import * as T from "./T"

import { readline, stderr, stdout } from "./utils"

////////////////////////////////////////////////////////////////////////////////

const RESOLVE_ROUTER = "resolve-router"

////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
interface PathInfo {
	source: string   // e.g. "path/to/basename.ext"
	dirname: string  // e.g. "path/to"
	basename: string // e.g. "basename.ext"
	name: string     // e.g. "basename"
	extname: string  // e.g. ".ext"
}

function newPathInfo(source: string): PathInfo {
	const dirname = path.dirname(source)
	const basename = path.basename(source)
	const extname = path.extname(source)
	const name = basename.slice(0, -extname.length)
	return { source, dirname, basename, name, extname }
}

////////////////////////////////////////////////////////////////////////////////

const transpile = (source: string, target: string): esbuild.BuildOptions => ({
	bundle: true,
	define: {
		__DEV__: JSON.stringify(process.env["NODE_ENV"] === "true"),
		"process.env.NODE_ENV": JSON.stringify(process.env["NODE_ENV"]),
	},
	entryPoints: [source],
	external: ["react", "react-dom"], // Dedupe
	format: "cjs",
	inject: ["scripts/react-shim.js"],
	loader: {
		".js": "jsx",
	},
	logLevel: "warning",
	minify: false,
	outfile: target,
	// plugins // TODO
})

async function resolveModule<Module extends T.AnyModule>(runtime: T.Runtime, route: T.Route): Promise<Module> {
	const source = route.Source // path.join(process.cwd(), route.Source)
	const target = path.join(runtime.Dirs.CacheDir, source.replace(/\..*$/, ".esbuild.js"))

	await esbuild.build(transpile(source, target))

	let mod: Module

	// Rethrow error; use catch to suppress esbuild
	// prettier-ignore
	try { mod = require(path.resolve(target)) }
	catch (error) { throw error }

	return mod
}

// src/pages/foo.html -> __export__/foo.html
export function getTargetSyntax(dirs: T.Dirs, pathInfo: PathInfo): string {
	const str = path.join(
		dirs.ExportDir,
		pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length) + ".html",
	)
	return str
}

// src/pages/foo.html -> /foo
export function getPathnameSyntax(dirs: T.Dirs, pathInfo: PathInfo): string {
	const str = pathInfo.source.slice(dirs.SrcPagesDir.length, -pathInfo.extname.length)
	if (str.endsWith("/index")) {
		return str.slice(0, -"index".length) // Keep "/"
	}
	return str
}

async function resolveStaticRouteMeta(runtime: T.Runtime, route: T.Route): Promise<T.RouteMeta> {
	const mod = await resolveModule<T.StaticModule>(runtime, route)
	// if (!valid.staticModuleExports(mod)) {
	// 	log.fatal(errors.badStaticPageExports(page.src))
	// }

	let props = {}
	if (typeof mod.serverProps === "function") {
		try {
			props = await mod.serverProps!()
			// if (!valid.serverPropsReturn(props)) {
			// 	log.fatal(errors.badServerPropsReturn(page.src))
			// }
		} catch (error) {
			// throw new Error(`${route.Source}.serverProps: ${error.message}`)
		}
	}

	const pathInfo = newPathInfo(route.Source)
	const target = getTargetSyntax(runtime.Dirs, pathInfo)
	const pathname = getPathnameSyntax(runtime.Dirs, pathInfo)

	const meta: T.RouteMeta = {
		Route: {
			...route,
			Target: target, // Uppercase
			Pathname: pathname, // Uppercase
		},
		Props: {
			path: pathname, // Add path
			...props,
		},
	}
	return meta
}

async function resolveDynamicRouteMetas(runtime: T.Runtime, route: T.Route): Promise<T.RouteMeta[]> {
	const mod = await resolveModule<T.DynamicModule>(runtime, route)
	// if (!valid.dynamicModuleExports(mod)) {
	// 	log.fatal(errors.badDynamicPageExports(page.src))
	// }

	let paths: { path: string; props: T.Props }[] = []
	try {
		paths = await mod.serverPaths!()
		// if (!valid.serverPathsReturn(paths)) {
		// 	log.fatal(errors.badServerPathsReturn(page.src))
		// }
	} catch (error) {
		// throw new Error(`${page.src}.serverPaths: ${error.message}`)
	}

	const metas: T.RouteMeta[] = []
	for (const meta of paths) {
		// Don’t use getTargetSyntax or getPathnameSyntax; paths must be computed
		// from meta.path because of serverPaths API
		const pathInfo = newPathInfo(route.Source)
		const pathname = path.join(pathInfo.dirname.slice(runtime.Dirs.SrcPagesDir.length), meta.path)
		const target = path.join(runtime.Dirs.ExportDir, pathname + ".html")
		metas.push({
			Route: {
				...route,
				Target: target, // Uppercase
				Pathname: pathname, // Uppercase
			},
			Props: {
				path: pathname, // Add path
				...meta.props,
			},
		})
	}
	return metas
}

async function resolveRouter(runtime: T.Runtime): Promise<T.Router> {
	const router: T.Router = {}
	for (const route of runtime.Routes) {
		if (route.Type === "static") {
			const meta = await resolveStaticRouteMeta(runtime, route)
			// if (router[meta.route.path] !== undefined) {
			// 	log.fatal(errors.repeatPath(meta.route, router[meta.route.path]!.route))
			// }
			router[meta.Route.Pathname] = meta
		} else if (route.Type === "dynamic") {
			const metas = await resolveDynamicRouteMetas(runtime, route)
			for (const meta of metas) {
				// if (router[meta.route.path] !== undefined) {
				// 	log.fatal(errors.repeatPath(meta.route, router[meta.route.path]!.route))
				// }
				router[meta.Route.Pathname] = meta
			}
		}
	}
	return router
}

async function main(): Promise<void> {
	while (true) {
		const bstr = await readline()
		if (bstr === undefined) {
			break
		}
		const msg = JSON.parse(bstr)
		switch (msg.Kind) {
			case RESOLVE_ROUTER:
				try {
					const router = await resolveRouter(msg.Data)
					stdout(router)
				} catch (error) {
					stderr(error)
				}
				break
			default:
				throw new Error("Internal error")
		}
	}
}

main()
