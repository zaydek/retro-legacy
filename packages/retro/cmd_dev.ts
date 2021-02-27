import * as esbuild from "esbuild"
import * as events from "./events"
import * as fs from "fs"
import * as http from "http"
import * as log from "../lib/log"
import * as p from "path"
import * as resolvers from "./resolvers"
import * as resolversText from "./resolvers-text"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

import preflight from "./preflight"

// interface ExportCache {
// 	[key: string]: {
// 		mtimeMs: number
// 		html: string
// 	}
// }

// async function build(runtime: types.Runtime<types.DevCommand>): Promise<esbuild.BuildResult> {
// 	const appContents = await resolversText.renderRouterToString(runtime)
// 	const appContentsPath = p.join(runtime.directories.cacheDir, "app.js")
// 	await fs.promises.writeFile(appContentsPath, appContents)
//
// 	let result: esbuild.BuildResult
// 	try {
// 		result = await esbuild.build({
// 			incremental: true, // TODO
//
// 			bundle: true,
// 			define: {
// 				__DEV__: process.env.__DEV__!,
// 				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
// 			},
// 			entryPoints: [appContentsPath],
// 			inject: ["packages/retro/react-shim.js"],
// 			loader: { ".js": "jsx" },
// 			logLevel: "silent", // TODO
// 			minify: false,
// 			outfile: p.join(runtime.directories.exportDir, appContentsPath.slice(runtime.directories.srcPagesDir.length)),
// 			// plugins: [...configs.retro.plugins], // TODO
// 		})
// 		// TODO: Add support for hints.
// 		if (result.warnings.length > 0) {
// 			for (const warning of result.warnings) {
// 				log.warning(utils.formatEsbuildMessage(warning, term.yellow))
// 			}
// 			process.exit(1)
// 		}
// 	} catch (err) {
// 		// TODO: Differentiate esbuild errors.
// 		log.error(utils.formatEsbuildMessage((err as esbuild.BuildFailure).errors[0]!, term.bold.red))
// 	}
//
// 	return result!
// }

// const cache: ExportCache = {}

export default async function retro_dev(runtime: types.Runtime<types.DevCommand>): Promise<void> {
	await preflight(runtime)

	// let emit: () => void | undefined
	//	const result = await build(runtime)
	//	// TODO: Add esbuild error-handling here.
	//
	//	async function watch(): Promise<void> {
	//		const generator = utils.watcher("src", { interval: 100 })
	//		async function next(): Promise<string> {
	//			return (await generator.next()).value
	//		}
	//
	//		// TODO: Add event here.
	//		while (true) {
	//			await next()
	//			await result.rebuild!()
	//			// TODO: Add esbuild error-handling here.
	//			if (emit) emit()
	//		}
	//	}
	//
	//	watch()

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: runtime.directories.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => events.serve(args),
	}, {})

	const srvProxy = http.createServer((req, res) => {
		const options = {
			hostname: result.host,
			port: result.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const reqProxy = http.request(options, resProxy => {
			// /404
			if (resProxy.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}

			// /~dev
			if (req.url === "/~dev") {
				// emit = (): void => {
				// 	res.write("event: reload\n\n")
				// }
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
				return
			}

			// OK request:
			res.writeHead(resProxy.statusCode!, resProxy.headers)
			resProxy.pipe(res, { end: true })
		})
		req.pipe(reqProxy, { end: true })
	})
	srvProxy.listen(runtime.command.port)

	//	const srv = http.createServer(
	//		async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
	//			// Server-sent events:
	//			const start = Date.now()
	//			if (req.url === "/~dev") {
	//				emit = (): void => {
	//					// TODO: Emit a log event here.
	//					res.write("event: reload\n\n")
	//				}
	//				res.writeHead(200, {
	//					"Content-Type": "text/event-stream",
	//					"Cache-Control": "no-cache",
	//					Connection: "keep-alive",
	//				})
	//				return
	//			}
	//
	//			// if (req.url === runtime.directories.publicDir) {
	//			// 	emit = (): void => {
	//			// 		// TODO: Emit a log event here.
	//			// 		res.write("event: reload\n\n")
	//			// 	}
	//			// 	res.writeHead(200, {
	//			// 		"Content-Type": "text/event-stream",
	//			// 		"Cache-Control": "no-cache",
	//			// 		Connection: "keep-alive",
	//			// 	})
	//			// 	return
	//			// }
	//
	//			// Bad path:
	//			const meta = runtime.router[req.url!]
	//			if (meta === undefined) {
	//				// Synthetic serve request arguments:
	//				events.serve({
	//					remoteAddress: "",
	//					method: "GET",
	//					path: req.url!,
	//					status: req.statusCode!,
	//					timeInMS: Date.now() - start,
	//				})
	//				res.writeHead(404, { "Content-Type": "text/plain" })
	//				res.end("404 - Not Found")
	//				return
	//			}
	//
	//			// Convert route to a page and regenerate component.esbuild.js:
	//			const mod = await resolvers.resolveModule(runtime, { ...meta.route })
	//
	//			const loaded: types.LoadedRouteMeta = { mod, meta }
	//			const text = await resolversText.renderRouteMetaToString(runtime, loaded)
	//
	//			res.writeHead(200, { "Content-Type": "text/html" })
	//			res.end(text)
	//		},
	//	)
	//	srv.listen(runtime.command.port)
}

// // Read from the cache:
// const stat = await fs.promises.stat(req.url!)
// const read = cache[req.url!]
// if (read !== undefined && read.mtimeMs !== stat.mtimeMs) {
// 	res.writeHead(200, { "Content-Type": "text/html" })
// 	res.end(read.html)
// 	return
// }

// // Bad cache read; rerender and cache:
// const html = await renderToString() // TODO
// cache[req.url!] = {
// 	mtimeMs: stat.mtimeMs,
// 	html,
// }
// // TODO: Emit a log event here (incl. read from the cache or not).
// res.writeHead(200, { "Content-Type": "text/html" })
// res.end(html)
