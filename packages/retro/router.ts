import * as errors from "./errors"
import * as esbuild from "esbuild"
import * as events from "./events"
import * as fs from "fs"
import * as log from "../lib/log"
import * as path from "path"
import * as resolversText from "./router-text"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

let service: esbuild.Service

async function resolve<ModuleKind extends types.PageModule>(
	runtime: types.Runtime,
	info: types.PageInfo | types.RouteInfo,
): Promise<ModuleKind> {
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

async function resolveStaticRoute(runtime: types.Runtime, info: types.StaticPageInfo): Promise<types.RouteMeta> {
	const module_ = await resolve<types.StaticPageModule>(runtime, info)
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

	const module_ = await resolve<types.DynamicPageModule>(runtime, info)
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

// resolveRouter resolves serverProps and serverPaths and generates the server-
// resolved router.
//
// TODO: Add support for hooks or middleware so logging can be externalized?
export default async function resolveRouter(runtime: types.Runtime): Promise<types.Router> {
	const router: types.Router = {}

	service = await esbuild.startService()

	const cache: types.RouteMeta[] = []
	for (const pageInfo of runtime.pageInfos) {
		if (pageInfo.type === "static") {
			const meta = await resolveStaticRoute(runtime, pageInfo)
			if (router[meta.routeInfo.path] !== undefined) {
				log.error(errors.duplicatePathFound(meta.routeInfo, router[meta.routeInfo.path]!.routeInfo))
			}
			cache.push(meta)
		} else {
			const metas = await resolveDynamicRoutes(runtime, pageInfo)
			for (const one of metas) {
				if (router[one.routeInfo.path] !== undefined) {
					log.error(errors.duplicatePathFound(one.routeInfo, router[one.routeInfo.path]!.routeInfo))
				}
			}
			cache.push(...metas)
		}
	}

	// TODO: Add support for --concurrent here?
	for (const meta of cache) {
		const start = Date.now()
		if (runtime.command.type === "export") {
			const out = await resolversText.renderRouteMetaToString(runtime, meta)
			await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
			await fs.promises.writeFile(meta.routeInfo.dst, out)
		}
		router[meta.routeInfo.path] = meta
		events.export_(runtime, meta, start)
	}

	console.log()
	return router
}
