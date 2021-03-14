import * as esbuild from "esbuild"
import * as path from "path"
import * as T from "./T"

import { readline, stderr, stdout } from "./utils"

////////////////////////////////////////////////////////////////////////////////

const RESOLVE_ROUTER = "resolve-router"

////////////////////////////////////////////////////////////////////////////////

const transpile = (source: string, target: string): esbuild.BuildOptions => ({
	bundle: true,
	define: {
		__DEV__: JSON.stringify(process.env.NODE_ENV === "true"),
		"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	},
	entryPoints: [source],
	external: ["react", "react-dom"], // Dedupe
	format: "cjs",
	inject: ["cmd/retro/js/react-shim.js"],
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

// prettier-ignore
export interface PathInfo {
	source: string   // e.g. "path/to/basename.ext"
	dirname: string  // e.g. "path/to"
	basename: string // e.g. "basename.ext"
	name: string     // e.g. "basename"
	extname: string  // e.g. ".ext"
}

export function parsePathInfo(source: string): PathInfo {
	const dirname = path.dirname(source)
	const basename = path.basename(source)
	const extname = path.extname(source)
	const name = basename.slice(0, -extname.length)
	return { source, dirname, basename, name, extname }
}

export function getTargetSyntax(dirs: T.Dirs, parsed: PathInfo): string {
	// prettier-ignore
	const out = path.join(
		dirs.ExportDir,
		parsed.src.slice(dirs.SrcPagesDir.length, -parsed.extname.length) + ".html",
	)
	return out
}

export function path_syntax(dirs: T.Dirs, parsed: PathInfo): string {
	const out = parsed.src.slice(dirs.SrcPagesDir.length, -parsed.extname.length)
	if (out.endsWith("/index")) {
		return out.slice(0, -"index".length) // Keep "/"
	}
	return out
}

async function resolveStaticRouteMeta(runtime: T.Runtime, route: T.Route): Promise<T.RouteMeta> {
	const mod = await resolveModule<T.StaticModule>(runtime, route)

	// if (!utils.validateStaticModuleExports(mod)) {
	// 	log.fatal(errors.badStaticPageExports(page.src))
	// }

	let props = {}
	if (typeof mod.serverProps === "function") {
		try {
			props = await mod.serverProps!()
			// if (!utils.validateServerPropsReturn(props)) {
			// 	log.fatal(errors.badServerPropsReturn(page.src))
			// }
		} catch (error) {
			throw new Error(`${route.Source}.serverProps: ${error.message}`)
		}
	}

	// const parsed = pages.parse(page.src)
	// const path_ = pages.path_syntax(runtime.dirs, parsed)
	// const dst = pages.dst_syntax(runtime.dirs, parsed)

	// const meta: T.RouteMeta = {
	// 	module: mod,
	// 	route: {
	// 		...page,
	// 		dst,
	// 		path: path_,
	// 	},
	// 	descriptProps: {
	// 		path: path_, // Add path
	// 		...props,
	// 	},
	// }
	return meta
}

async function resolveDynamicRouteMetas(runtime: T.Runtime, route: T.Route): Promise<T.RouteMeta[]> {
	const mod = await resolveModule<T.DynamicModule>(runtime, route)
	// ...
	return [] as T.RouteMeta[]
}

// stdout(JSON.stringify(runtime.Routes, null, 2))
async function resolveRouter(runtime: T.Runtime): Promise<T.Router> {
	const router: T.Router = {}
	for (const route of runtime.Routes) {
		if (route.Type === "static") {
			const meta = resolveStaticRouteMeta(runtime, route)
		} else if (route.Type === "dynamic") {
			const metas = await resolveDynamicRouteMetas(runtime, route)
		} else {
			throw new Error("Internal error")
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
				let router: T.Router
				try {
					router = await resolveRouter(msg.Data)
				} catch (error) {
					stderr(error)
				}
				stdout(router)
				break
			// case DIE:
			// 	return
			default:
				throw new Error("Internal error")
		}
	}
}

main()
