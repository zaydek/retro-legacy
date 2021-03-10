import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as log from "../../shared/log"
import * as path from "path"
import * as T from "../types"
import * as utils from "../utils"

// import * as terminal from "../../shared/terminal"

export async function resolveModule<M extends T.AnyPageModule>(r: T.Runtime, src: string): Promise<M> {
	src = src
	const dst = path.join(r.dirs.cacheDir, src.replace(/\..*$/, ".esbuild.js"))

	try {
		await esbuild.build(esbuildHelpers.transpileOnlyConfiguration(src, dst))
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

	let module_: M
	try {
		// TODO: Change to path.relative?
		module_ = require(path.join(process.cwd(), dst))
	} catch (error) {
		log.error(error)
	}

	return module_!
}

async function resolveStaticRoute(r: T.Runtime, pageInfo: T.StaticPageInfo): Promise<T.RouteMeta> {
	const module_ = await resolveModule<T.StaticPageModule>(r, pageInfo.src)
	if (!utils.validateStaticModuleExports(module_)) {
		log.error(errors.badStaticPageExports(pageInfo.src))
	}

	let props = {}
	if (typeof module_.serverProps === "function") {
		try {
			props = await module_.serverProps!()
			if (!utils.validateServerPropsReturn(props)) {
				log.error(errors.badServerPropsReturn(pageInfo.src))
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

async function resolveDynamicRoutes(r: T.Runtime, pageInfo: T.DynamicPageInfo): Promise<T.RouteMeta[]> {
	const metas: T.RouteMeta[] = []

	const module_ = await resolveModule<T.DynamicPageModule>(r, pageInfo.src)
	if (!utils.validateDynamicModuleExports(module_)) {
		log.error(errors.badDynamicPageExports(pageInfo.src))
	}

	let paths: { path: string; props: T.Props }[] = []
	try {
		paths = await module_.serverPaths!()
		if (!utils.validateServerPathsReturn(paths)) {
			log.error(errors.badServerPathsReturn(pageInfo.src))
		}
	} catch (error) {
		// TODO: FIXME
		if (!utils.validateServerPathsReturn(paths)) {
			log.error(errors.badServerPathsReturn(pageInfo.src))
		}
		log.error(`${pageInfo.src}.serverPaths: ${error.message}`)
	}

	for (const meta of paths) {
		const path_ = path.join(path.dirname(pageInfo.src).slice(r.dirs.srcPagesDir.length), meta.path)
		const dst = path.join(r.dirs.exportDir, path_ + ".html")
		metas.push({
			module: module_,
			pageInfo: pageInfo,
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
export async function newFromRuntime(runtime: T.Runtime): Promise<T.Router> {
	const router: T.Router = {}

	for (const pageInfo of runtime.pages) {
		if (pageInfo.type === "static") {
			const meta = await resolveStaticRoute(runtime, pageInfo)
			if (router[meta.routeInfo.path] !== undefined) {
				log.error(errors.repeatPath(meta.routeInfo, router[meta.routeInfo.path]!.routeInfo))
			}
			router[meta.routeInfo.path] = meta
		} else {
			const metas = await resolveDynamicRoutes(runtime, pageInfo)
			for (const meta of metas) {
				if (router[meta.routeInfo.path] !== undefined) {
					log.error(errors.repeatPath(meta.routeInfo, router[meta.routeInfo.path]!.routeInfo))
				}
				router[meta.routeInfo.path] = meta
			}
		}
	}
	return router
}
