import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as helpers from "../esbuild-helpers"
import * as log from "../../lib/log"
import * as path from "path"
import * as terminal from "../../lib/terminal"
import * as types from "../types"
import * as utils from "../utils"

let service: esbuild.Service

async function resolveModule<ModuleKind extends types.PageModule>(
	runtime: types.Runtime,
	info: types.PageInfo | types.RouteInfo,
): Promise<ModuleKind> {
	const src = info.src
	const dst = path.join(runtime.directories.cacheDirectory, info.src.replace(/\.*$/, ".esbuild.js"))

	try {
		const result = await service.build(helpers.transpileJSXAndTSConfiguration(src, dst))
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(helpers.format(warning, terminal.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		if (!("errors" in err) || !("warnings" in err)) throw err
		log.error(helpers.format((err as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
	}

	// See https://github.com/evanw/esbuild/issues/661.
	let module_: ModuleKind
	try {
		module_ = require(path.join("..", "..", dst))
	} catch {}

	return module_!
}

async function resolveStaticRoute(runtime: types.Runtime, info: types.StaticPageInfo): Promise<types.RouteMeta> {
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

async function resolveDynamicRoutes(runtime: types.Runtime, info: types.DynamicPageInfo): Promise<types.RouteMeta[]> {
	const metas: types.RouteMeta[] = []

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
		metas.push({
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
	return metas
}

// newFromRuntime resolves serverProps and serverPaths and generates a server-
// resolved router.
//
// TODO: Add support for hooks or middleware so logging can be externalized?
export async function newFromRuntime(runtime: types.Runtime): Promise<types.Router> {
	const router: types.Router = {}

	service = await esbuild.startService()
	for (const pageInfo of runtime.pageInfos) {
		if (pageInfo.type === "static") {
			const meta = await resolveStaticRoute(runtime, pageInfo)
			if (router[meta.routeInfo.path] !== undefined) {
				log.error(errors.duplicatePath(meta.routeInfo, router[meta.routeInfo.path]!.routeInfo))
			}
			router[meta.routeInfo.path] = meta
		} else {
			const metas = await resolveDynamicRoutes(runtime, pageInfo)
			for (const meta of metas) {
				if (router[meta.routeInfo.path] !== undefined) {
					log.error(errors.duplicatePath(meta.routeInfo, router[meta.routeInfo.path]!.routeInfo))
				}
				router[meta.routeInfo.path] = meta
			}
		}
	}
	return router
}
