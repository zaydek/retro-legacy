import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as log from "../../shared/log"
import * as path from "path"
import * as terminal from "../../shared/terminal"
import * as types from "../types"
import * as utils from "../utils"

let service: esbuild.Service

export async function resolveModule<ModuleKind extends types.PageModule>(
	runtime: types.Runtime,
	src: string,
): Promise<ModuleKind> {
	src = src
	const dst = path.join(runtime.directories.cacheDirectory, src.replace(/\..*$/, ".esbuild.js"))

	try {
		const result = await service.build(esbuildHelpers.transpileJSXAndTSConfiguration(src, dst))
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(esbuildHelpers.format(warning, terminal.yellow))
			}
			process.exit(1)
		}
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		log.error(esbuildHelpers.format((error as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
	}

	let module_: ModuleKind
	try {
		// TODO: Change to path.relative?
		module_ = require(path.join("..", "..", dst))
	} catch (error) {
		log.error(error)
	}

	return module_!
}

async function resolveStaticRoute(runtime: types.Runtime, pageInfo: types.StaticPageInfo): Promise<types.RouteMeta> {
	const module_ = await resolveModule<types.StaticPageModule>(runtime, pageInfo.src)
	if (!utils.validateStaticModuleExports(module_)) {
		log.error(errors.badStaticPageExports(pageInfo.src))
	}

	let props = {}
	if (typeof module_.serverProps === "function") {
		try {
			await module_.serverProps!()
			if (!utils.validateServerPropsReturn(props)) {
				log.error(errors.badServerPropsResolver(pageInfo.src))
			}
		} catch (error) {
			log.error(`${pageInfo.src}.serverProps: ${error.message}`)
		}
	}

	const routeInfo = pageInfo
	const descriptProps = { path: pageInfo.path, ...props }

	const meta = { module: module_, pageInfo, routeInfo, descriptProps }
	return meta
}

async function resolveDynamicRoutes(
	runtime: types.Runtime,
	pageInfo: types.DynamicPageInfo,
): Promise<types.RouteMeta[]> {
	const metas: types.RouteMeta[] = []

	const module_ = await resolveModule<types.DynamicPageModule>(runtime, pageInfo.src)
	if (!utils.validateDynamicModuleExports(module_)) {
		log.error(errors.badDynamicPageExports(pageInfo.src))
	}

	let paths: { path: string; props: types.Props }[] = []
	try {
		paths = await module_.serverPaths!()
		if (!utils.validateServerPathsReturn(paths)) {
			log.error(errors.badServerPathsResolver(pageInfo.src))
		}
	} catch (error) {
		log.error(`${pageInfo.src}.serverPaths: ${error.message}`)
	}

	for (const meta of paths) {
		const path_ = path.join(path.dirname(pageInfo.src).slice(runtime.directories.srcPagesDirectory.length), meta.path)
		const dst = path.join(runtime.directories.exportDirectory, path_ + ".html")
		metas.push({
			module: module_,
			pageInfo,
			routeInfo: {
				...pageInfo,
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
