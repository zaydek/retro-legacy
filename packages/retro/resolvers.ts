import * as errs from "./errs"
import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as loggers from "./utils/logTypes"
import * as p from "path"
import * as resolversText from "./resolversText"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

////////////////////////////////////////////////////////////////////////////////

type resolveStaticRoute = (
	runtime: types.Runtime<types.DevOrExportCommand>,
	page: types.StaticPageMeta,
	outfile: string,
) => Promise<types.LoadedServerRouteMeta>

type resolveDynamicRoutes = (
	runtime: types.Runtime<types.DevOrExportCommand>,
	page: types.DynamicPageMeta, // TODO: Can we change to dynamic page meta?
	outfile: string,
) => Promise<types.LoadedServerRouteMeta[]>

type resolveServerRouter = (runtime: types.Runtime<types.DevOrExportCommand>) => Promise<types.Router>

////////////////////////////////////////////////////////////////////////////////

const resolveStaticRoute: resolveStaticRoute = async (_, page, outfile) => {
	let props: types.RouteProps = { path: page.path }

	// NOTE: Use try-catch to suppress esbuild dynamic import warning.
	let mod: types.StaticPageModule
	try {
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverProps" in mod! && typeof mod.serverProps !== "function") {
		log.error(errs.serverPropsFunction(page.src))
	} else if ("serverPaths" in mod! && typeof (mod as { [key: string]: unknown }).serverPaths === "function") {
		log.error(errs.serverPathsMismatch(page.src))
	}

	// Resolve serverProps:
	if (typeof mod!.serverProps === "function") {
		try {
			const serverProps = await mod!.serverProps!()
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

	const loaded = { meta: { route: page, props }, module: mod! }
	return loaded
}

const resolveDynamicRoutes: resolveDynamicRoutes = async (runtime, page, outfile) => {
	const loaded: types.LoadedServerRouteMeta[] = []

	// NOTE: Use try-catch to suppress esbuild warning.
	let mod: types.DynamicPageModule
	try {
		// TODO: Change to new import syntax?
		// https://github.com/evanw/esbuild/releases/tag/v0.8.53
		mod = require(p.join("..", "..", outfile))
	} catch {}

	// Guard serverProps and serverPaths:
	if ("serverPaths" in mod! && typeof mod.serverPaths !== "function") {
		log.error(errs.serverPathsFunction(page.src))
	} else if ("serverProps" in mod! && typeof (mod as { [key: string]: unknown }).serverProps === "function") {
		log.error(errs.serverPropsMismatch(page.src))
	}

	// Resolve serverPaths:
	if (typeof mod!.serverPaths === "function") {
		let paths: { path: string; props: types.Props }[] = []
		try {
			paths = await mod!.serverPaths!()
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
				module: mod!,
			})
		}
	}

	return loaded
}

interface Formatter {
	start(): void
	end(): void
}

function formatter(): Formatter {
	let once = false
	return {
		start(): void {
			if (once) return
			console.log()
			once = true
		},
		end(): void {
			console.log()
		},
	}
}

// resolveServerRouter resolves serverProps and serverPaths and generates the
// server router.
//
// TODO: Extract middleware so loggers can be externalized?
export const resolveServerRouter: resolveServerRouter = async runtime => {
	const router: types.Router = {}

	const format = formatter()

	// TODO: Add --concurrent?
	const service = await esbuild.startService()
	for (const page of runtime.pages) {
		// Compute metadata for esbuild:
		const entryPoints = [page.src]
		const outfile = p.join(runtime.directories.cacheDir, page.src.replace(/\.(jsx?|tsx?|mdx?)$/, ".esbuild.js"))

		// Cache components to an intermediary build artifact; component.esbuild.js.
		// These artifacts enable interop with Node.js because require doesn’t
		// understand a) JSX and b) TypeScript.
		//
		// Previously, there was a prototype that used 'ts-node -T' that was simpler
		// but slower.
		try {
			// NOTE: Externalize "react" and "react-dom" to prevent a runtime React
			// error: You might have mismatching versions of React and the renderer
			// (such as React DOM).
			const result = await service.build({
				bundle: true,
				define: {
					__DEV__: process.env.__DEV__!,
					"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV!),
				},
				entryPoints,
				external: ["react", "react-dom"],
				format: "cjs", // Use "cjs" to enable require(...)
				inject: ["packages/retro/react-shim.js"],
				loader: { ".js": "jsx" },
				logLevel: "silent", // TODO
				outfile,
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

		let start = Date.now()

		// Aggregate resolved metas:
		const loaded: types.LoadedServerRouteMeta[] = []
		if (page.type === "static") {
			const one = await resolveStaticRoute(runtime, page, outfile)
			loaded.push(one)
		} else {
			const many = await resolveDynamicRoutes(runtime, page, outfile)
			loaded.push(...many)
		}

		for (const each of loaded) {
			if (router[each.meta.route.path] !== undefined) {
				log.error(errs.duplicatePathFound(each.meta.route, router[each.meta.route.path]!.route))
			}
			format.start()
			router[each.meta.route.path] = each.meta

			// Export components (__export__):
			if (runtime.command.type === "export") {
				const text = await resolversText.renderServerRouteMetaToString(runtime, each)
				await fs.promises.mkdir(p.dirname(each.meta.route.dst), { recursive: true })
				await fs.promises.writeFile(each.meta.route.dst, text)
			}
			loggers.exportEvent(runtime, each.meta, start)
			start = 0 // Reset
		}
	}

	format.end()
	return router
}
