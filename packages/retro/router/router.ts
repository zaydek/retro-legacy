import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as log from "../../shared/log"
import * as pages from "../pages"
import * as path from "path"
import * as T from "../types"
import * as utils from "../utils"

export async function resolveModule<Module extends T.AnyPageModule>(runtime: T.Runtime, src: string): Promise<Module> {
	const dst = path.join(runtime.dirs.cacheDir, src.replace(/\..*$/, ".esbuild.js"))

	try {
		await esbuild.build(esbuildHelpers.transpileOnlyConfiguration(src, dst))
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

	let mod: Module
	try {
		// TODO: Upgrade to path.relative.
		mod = require(path.join(process.cwd(), dst))
	} catch (error) {
		log.fatal(error)
	}

	return mod!
}

async function resolveStaticRouteMeta(runtime: T.Runtime, page: T.FSPageInfo): Promise<T.ServerRouteMeta> {
	const mod = await resolveModule<T.StaticPageModule>(runtime, page.src)
	if (!utils.validateStaticModuleExports(mod)) {
		log.fatal(errors.badStaticPageExports(page.src))
	}

	let props = {}
	if (typeof mod.serverProps === "function") {
		try {
			props = await mod.serverProps!()
			if (!utils.validateServerPropsReturn(props)) {
				log.fatal(errors.badServerPropsReturn(page.src))
			}
		} catch (error) {
			log.fatal(`${page.src}.serverProps: ${error.message}`)
		}
	}

	const parsed = pages.parse(page.src)
	const path_ = pages.path_syntax(runtime.dirs, parsed)
	const dst = pages.dst_syntax(runtime.dirs, parsed)

	const meta: T.ServerRouteMeta = {
		module: mod,
		route: {
			...page,
			dst,
			path: path_,
		},
		descriptProps: {
			path: path_, // Add path
			...props,
		},
	}
	return meta
}

async function resolveDynamicRouteMetas(runtime: T.Runtime, page: T.FSPageInfo): Promise<T.ServerRouteMeta[]> {
	const metas: T.ServerRouteMeta[] = []

	const mod = await resolveModule<T.DynamicPageModule>(runtime, page.src)
	if (!utils.validateDynamicModuleExports(mod)) {
		log.fatal(errors.badDynamicPageExports(page.src))
	}

	let paths: { path: string; props: T.Props }[] = []
	try {
		paths = await mod.serverPaths!()
		if (!utils.validateServerPathsReturn(paths)) {
			log.fatal(errors.badServerPathsReturn(page.src))
		}
	} catch (error) {
		log.fatal(`${page.src}.serverPaths: ${error.message}`)
	}

	for (const meta of paths) {
		// NOTE: Do not use pages.path_syntax or pages.dst_syntax here; path must be
		// computed from meta.path.
		const parsed = pages.parse(page.src)
		const path_ = path.join(parsed.dirname.slice(runtime.dirs.srcPagesDir.length), meta.path)
		const dst = path.join(runtime.dirs.exportDir, path_ + ".html")
		metas.push({
			module: mod,
			route: {
				...page,
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

export async function newRouterFromRuntime(runtime: T.Runtime): Promise<T.ServerRouter> {
	const router: T.ServerRouter = {}

	for (const page of runtime.pages) {
		if (page.type === "static") {
			const meta = await resolveStaticRouteMeta(runtime, page)
			if (router[meta.route.path] !== undefined) {
				log.fatal(errors.repeatPath(meta.route, router[meta.route.path]!.route))
			}
			router[meta.route.path] = meta
		} else {
			const metas = await resolveDynamicRouteMetas(runtime, page)
			for (const meta of metas) {
				if (router[meta.route.path] !== undefined) {
					log.fatal(errors.repeatPath(meta.route, router[meta.route.path]!.route))
				}
				router[meta.route.path] = meta
			}
		}
	}
	return router
}
