// import * as events from "./events"
// import * as fs from "fs/promises"
// import * as resolversText from "./router-text"
import * as errors from "./errors"
import * as esbuild from "esbuild"
import * as log from "../lib/log"
import * as path from "path"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

////////////////////////////////////////////////////////////////////////////////
// Types
////////////////////////////////////////////////////////////////////////////////

type Resolve = <ModuleKind extends types.PageModule>(
	runtime: types.Runtime,
	info: types.PageInfo | types.RouteInfo,
) => Promise<ModuleKind>

type ResolveStaticRoute = (runtime: types.Runtime, info: types.StaticPageInfo) => Promise<InMemoryRoute>

type ResolveDynamicRoutes = (runtime: types.Runtime, info: types.DynamicPageInfo) => Promise<InMemoryRoute[]>

interface InMemoryRoute {
	module: types.PageModule
	routeInfo: types.RouteInfo
	descriptProps: types.DescriptProps
}

////////////////////////////////////////////////////////////////////////////////

let service: esbuild.Service

export const resolveModule: Resolve = async <ModuleKind>(
	runtime: types.Runtime,
	info: types.PageInfo | types.RouteInfo,
) => {
	const src = info.src
	const dst = path.join(runtime.directories.cacheDirectory, info.src.replace(/\.*$/, ".esbuild.js"))

	try {
		const result = await service.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV!),
			},
			entryPoints: [src],
			external: ["react", "react-dom"],
			format: "cjs",
			inject: ["packages/retro/react-shim.js"],
			loader: {
				".js": "jsx",
			},
			logLevel: "silent",
			outfile: dst,
			// plugins: [...configs.retro.plugins], // TODO
		})
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(utils.format_esbuild(warning, term.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		if (!("errors" in err) || !("warnings" in err)) throw err
		log.error(utils.format_esbuild((err as esbuild.BuildFailure).errors[0]!, term.bold.red))
	}

	// See https://github.com/evanw/esbuild/issues/661.
	let module_: ModuleKind
	try {
		module_ = require(path.join("..", "..", dst))
	} catch {}

	return module_!
}

export const resolveStaticRoute: ResolveStaticRoute = async (runtime, info) => {
	const module_ = await resolveModule<types.StaticPageModule>(runtime, info)
	if (!utils.validateStaticModuleExports(module_)) {
		log.error(errors.badStaticPageExports(info.src))
	}

	let props = {}
	if (typeof module_.serverProps === "function") {
		try {
			await module_.serverProps!()
			if (!utils.validateServerPropsReturn(props)) {
				log.error(errors.badServerPropsResolver(info.src))
			}
		} catch (err) {
			log.error(`${info.src}.serverProps: ${err.message}`)
		}
	}

	const routeInfo = info
	const descriptProps = { path: info.path, ...props }

	return { module: module_, routeInfo, descriptProps }
}

export const resolveDynamicRoutes: ResolveDynamicRoutes = async (runtime, info) => {
	const cache: InMemoryRoute[] = []

	const module_ = await resolveModule<types.DynamicPageModule>(runtime, info)
	if (!utils.validateDynamicModuleExports(module_)) {
		log.error(errors.badDynamicPageExports(info.src))
	}

	let paths: { path: string; props: types.Props }[] = []
	try {
		paths = await module_.serverPaths!()
		if (!utils.validateServerPathsReturn(paths)) {
			log.error(errors.badServerPathsResolver(info.src))
		}
	} catch (err) {
		log.error(`${info.src}.serverPaths: ${err.message}`)
	}

	for (const meta of paths) {
		const path_ = path.join(path.dirname(info.src).slice(runtime.directories.srcPagesDirectory.length), meta.path)
		const dst = path.join(runtime.directories.exportDirectory, path_ + ".html")
		cache.push({
			module: module_,
			routeInfo: {
				...info,
				dst,
				path: path_,
			},
			descriptProps: {
				path: path_, // Add path
				...meta.props,
			},
		})
	}
	return cache
}

// resolveRouter resolves serverProps and serverPaths and generates the server-
// resolved router.
//
// TODO: Add support for hooks or middleware so logging can be externalized?
export async function resolveRouter(runtime: types.Runtime): Promise<types.Router> {
	const router: types.Router = {}

	const cache: InMemoryRoute[] = []
	for (const pageInfo of runtime.pageInfos) {
		const cache: InMemoryRoute[] = []
		if (pageInfo.type === "static") {
			const one = await resolveStaticRoute(runtime, pageInfo)
			cache.push(one)
		} else {
			const many = await resolveDynamicRoutes(runtime, pageInfo)
			cache.push(...many)
		}
	}

	// ...

	return router

	//	const router: types.Router = {}
	//
	//	// TODO: Add support for --concurrent here?
	//	service = await esbuild.startService()
	//	for (const pageInfo of runtime.pages) {
	//		let start = Date.now()
	//
	//		const loaded: types.LoadedRouteMeta[] = []
	//		if (pageInfo.type === "static") {
	//			const one = await resolveStaticRoute(runtime, pageInfo)
	//			loaded.push(one)
	//		} else {
	//			const many = await resolveDynamicRoutes(runtime, pageInfo)
	//			loaded.push(...many)
	//		}
	//
	//		for (const each of loaded) {
	//			if (router[each.meta.route.path] !== undefined) {
	//				log.error(errors.duplicatePathFound(each.meta.route, router[each.meta.route.path]!.route))
	//			}
	//			format.format()
	//			router[each.meta.route.path] = each.meta
	//
	//			// Write to disk:
	//			if (runtime.command.type === "export") {
	//				const out = await resolversText.renderRouteMetaToString(runtime, each)
	//				await fs.mkdir(p.dirname(each.meta.route.dst), { recursive: true })
	//				await fs.writeFile(each.meta.route.dst, out)
	//			}
	//
	//			events.export_(runtime, each.meta, start)
	//			start = 0 // Reset
	//		}
	//	}
	//
	//	format.done()
	//	return router
}
