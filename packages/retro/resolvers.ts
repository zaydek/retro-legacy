import * as errs from "./errs"
import * as esbuild from "esbuild"
import * as events from "./events"
import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as resolversText from "./resolvers-text"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

////////////////////////////////////////////////////////////////////////////////

type resolveModule = (
	runtime: types.Runtime<types.DevOrExportCommand>,
	page: types.PageInfo,
) => Promise<types.PageModule>

type resolveStaticRoute = (
	runtime: types.Runtime<types.DevOrExportCommand>,
	page: types.StaticPageInfo,
) => Promise<types.LoadedRouteMeta>

type resolveDynamicRoutes = (
	runtime: types.Runtime<types.DevOrExportCommand>,
	page: types.DynamicPageInfo,
) => Promise<types.LoadedRouteMeta[]>

type resolveServerRouter = (runtime: types.Runtime<types.DevOrExportCommand>) => Promise<types.Router>

////////////////////////////////////////////////////////////////////////////////

let service: esbuild.Service

interface Formatter {
	start(): void
	done(): void
}

function formatter(): Formatter {
	let once = false
	return {
		start(): void {
			if (once) return
			console.log()
			once = true
		},
		done(): void {
			console.log()
		},
	}
}

const format = formatter()

////////////////////////////////////////////////////////////////////////////////

const resolveModule: resolveModule = async (runtime, page) => {
	const target = p.join(runtime.directories.cacheDir, page.src.replace(/\.*$/, ".esbuild.js"))

	// Cache components to an intermediary build artifact; component.esbuild.js.
	// These artifacts enable interop with Node.js because require doesn’t
	// understand a) JSX and b) TypeScript.
	//
	// Previously, there was a prototype that used 'ts-node -T' that was simpler
	// but slower.
	try {
		// Use 'external: ["react", "react-dom"]' to prevent a runtime React error:
		// You might have mismatching versions of React and the renderer (such as
		// React DOM).
		const result = await service.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV!),
			},
			entryPoints: [page.src],
			external: ["react", "react-dom"],
			format: "cjs", // Use "cjs" to enable require(...)
			inject: ["packages/retro/react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			outfile: target,
			// plugins: [...configs.retro.plugins], // TODO
		})
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(utils.formatEsbuildMessage(warning, term.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		// TODO: Differentiate esbuild errors.
		log.error(utils.formatEsbuildMessage((err as esbuild.BuildFailure).errors[0]!, term.bold.red))
	}

	let mod: types.PageModule = {}

	// Use try-catch to suppress esbuild dynamic import warning.
	// prettier-ignore
	try { mod = require(p.join("..", "..", target)) } catch {}
	return mod
}

const resolveStaticRoute: resolveStaticRoute = async (runtime, page) => {
	let props: types.RouteProps = { path: page.path }

	// Guard serverProps and serverPaths:
	const mod = (await resolveModule(runtime, page)) as types.StaticPageModule
	if ("serverProps" in mod && typeof mod.serverProps !== "function") {
		log.error(errs.serverPropsFunction(page.src))
	} else if ("serverPaths" in mod && typeof (mod as { [key: string]: unknown }).serverPaths === "function") {
		log.error(errs.serverPathsMismatch(page.src))
	}

	// Resolve serverProps:
	if (typeof mod.serverProps === "function") {
		try {
			const serverProps = await mod.serverProps!()
			if (!utils.validateServerPropsReturn(serverProps)) {
				log.error(errs.serverPropsReturn(page.src))
			}
			props = {
				// @ts-ignore
				path: page.path, // Add path (takes precedence)
				...serverProps,
			}
		} catch (err) {
			log.error(`${page.src}.serverProps: ${err.message}`)
		}
	}

	const loaded = { meta: { route: page, props }, module: mod }
	return loaded
}

const resolveDynamicRoutes: resolveDynamicRoutes = async (runtime, page) => {
	const loaded: types.LoadedRouteMeta[] = []

	// Guard serverProps and serverPaths:
	const mod = (await resolveModule(runtime, page)) as types.DynamicPageModule
	if ("serverPaths" in mod && typeof mod.serverPaths !== "function") {
		log.error(errs.serverPathsFunction(page.src))
	} else if ("serverProps" in mod && typeof (mod as { [key: string]: unknown }).serverProps === "function") {
		log.error(errs.serverPropsMismatch(page.src))
	}

	// Resolve serverPaths:
	if (typeof mod.serverPaths === "function") {
		let paths: { path: string; props: types.Props }[] = []
		try {
			paths = await mod.serverPaths!()
			if (!utils.validateServerPathsReturn(paths)) {
				log.error(errs.serverPathsReturn(page.src))
			}
		} catch (err) {
			log.error(`${page.src}.serverPaths: ${err.message}`)
		}

		for (const path of paths) {
			const path_ = p.join(p.dirname(page.src).slice(runtime.directories.srcPagesDir.length), path.path)
			const dst = p.join(runtime.directories.exportDir, path_ + ".html")
			loaded.push({
				meta: {
					// prettier-ignore
					route: {
						...page,
						dst,         // Recompute dst
						path: path_, // Recompute path
					},
					props: {
						path: path_, // Add path (takes precedence)
						...path.props,
					},
				},
				module: mod,
			})
		}
	}

	return loaded
}

// resolveServerRouter resolves serverProps and serverPaths and generates the
// server router.
//
// TODO: Extract middleware so loggers can be externalized?
export const resolveServerRouter: resolveServerRouter = async runtime => {
	const router: types.Router = {}

	// TODO: Add --concurrent?
	service = await esbuild.startService()
	for (const page of runtime.pages) {
		let start = Date.now()

		const loaded: types.LoadedRouteMeta[] = []
		if (page.type === "static") {
			const one = await resolveStaticRoute(runtime, page)
			loaded.push(one)
		} else {
			const many = await resolveDynamicRoutes(runtime, page)
			loaded.push(...many)
		}

		for (const each of loaded) {
			if (router[each.meta.route.path] !== undefined) {
				log.error(errs.duplicatePathFound(each.meta.route, router[each.meta.route.path]!.route))
			}
			format.start()
			router[each.meta.route.path] = each.meta
			if (runtime.command.type === "export") {
				const text = await resolversText.renderServerRouteMetaToString(runtime, each)
				await fs.promises.mkdir(p.dirname(each.meta.route.dst), { recursive: true })
				await fs.promises.writeFile(each.meta.route.dst, text)
				events.export_(runtime, each.meta, start)
			}
			start = 0 // Reset
		}
	}

	format.done()
	return router
}
