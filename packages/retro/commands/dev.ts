import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as fs from "fs"
import * as http from "http"
import * as log from "../../shared/log"
import * as logEvents from "../logEvents"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"
import * as utils from "../utils"

import { EPOCH } from "../main"

// import * as terminal from "../../shared/terminal"

// function handleEsbuildWarnings(result: esbuild.BuildResult): void {
// 	if (result.warnings.length === 0) {
// 		// No-op
// 		return
// 	}
// 	for (const warning of result.warnings) {
// 		log.warning(esbuildHelpers.format(warning, terminal.yellow))
// 	}
// 	process.exit(1)
// }
//
// // TODO: Integrate handleEsbuildWarnings.
// function handleEsbuildError(error: Error): void {
// 	if (error === undefined || error === null) {
// 		// No-op
// 		return
// 	}
// 	if (!("errors" in error) || !("warnings" in error)) throw error
// 	log.error(esbuildHelpers.format((error as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
// }

// Step 1: Build app.js with watch mode enabled
// Step 2: On watch, rebuild app.js
// Step 3: On HTTP requests, render and cache the current page to string and ~~rebuild app.js~~
export async function dev(runtime: T.Runtime<T.DevCommand>): Promise<void> {
	// await exportPages(runtime)

	// Build __cache__/app.js:
	const src = path.join(runtime.dirs.cacheDir, "app.js")
	const contents = router.routerToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	// Build __export__/app.js:
	const dst = path.join(runtime.dirs.exportDir, src.slice(runtime.dirs.srcPagesDir.length))

	// let buildResult: esbuild.BuildResult
	try {
		await esbuild.build({
			...esbuildHelpers.bundleConfiguration(src, dst),
			incremental: true,
			watch: {
				// onRebuild(error, result) {
				// 	if (error !== null) handleEsbuildError(error)
				// 	if (result !== null) handleEsbuildWarnings(result)
				// },
			},
		})
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

	let serveResult: esbuild.ServeResult
	try {
		let once = false
		serveResult = await esbuild.serve(
			{
				// port: random(1_000, 10_000, [runtime.command.port]),
				servedir: runtime.dirs.exportDir,
				onRequest: (args: esbuild.ServeOnRequestArgs) => {
					if (!once) {
						console.log()
						once = true
					}
					logEvents.serve(args)
				},
			},
			{},
		)
	} catch (error) {
		// handleEsbuildError(error)
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

	// console.log(serveResult!.port)

	// This implementation is roughly based on:
	//
	// - https://esbuild.github.io/api/#customizing-server-behavior
	// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
	//
	const server_proxy = http.createServer(async (req, res) => {
		const opts = {
			hostname: serveResult.host, // Reuse servedir host
			port: serveResult.port, // Reuse servedir port
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}

		// ~/dev
		if (req.url === "/~dev") {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			})
			// ...
			return
		}

		let url = req.url!
		if (url.endsWith(".html")) {
			url = url.slice(0, -".html".length) // "/index.html" -> "/index"
		}
		if (url.endsWith("/index")) {
			url = url.slice(0, -"index".length) // "/index" -> "/"
		}

		// let url = req.url!
		// switch (true) {
		// 	case url.endsWith("/index.html"):
		// 		url = url.slice(0, -"index.html".length)
		// 		break
		// 	case url.endsWith("/index"):
		// 		url = url.slice(0, -"index".length)
		// 		break
		// 	case url.endsWith(".html"):
		// 		url = url.slice(0, -".html".length)
		// 		break
		// }

		if (!url.startsWith("/" + runtime.dirs.wwwDir) && path.extname(url) === "") {
			let meta = runtime.router[url]
			if (meta === undefined) {
				try {
					console.log("a")
					const buffer = await fs.promises.readFile(path.join(runtime.dirs.exportDir, "404.html"))
					res.writeHead(200, { "Content-Type": "text/html" })
					res.end(buffer.toString())
				} catch (error) {
					console.log("b")
					res.writeHead(404, { "Content-Type": "text/plain" })
					res.end("404 - Not Found")
				}
				return
			}

			const src = meta.routeInfo.src
			const dst = path.join(runtime.dirs.cacheDir, src.replace(/\..*$/, ".esbuild.js"))

			try {
				await esbuild.build(esbuildHelpers.transpileOnlyConfiguration(src, dst))
				// if (result.warnings.length > 0) {
				// 	for (const warning of result.warnings) {
				// 		log.warning(esbuildHelpers.format(warning, terminal.yellow))
				// 	}
				// 	process.exit(1)
				// }
			} catch (error) {
				if (!("errors" in error) || !("warnings" in error)) throw error
				// 	process.exit(1)
			}

			let module_: T.AnyPageModule
			try {
				const path_ = path.join(process.cwd(), dst)
				module_ = await require(path_)
				delete require.cache[require.resolve(path_)] // Purge the dependency cache
				meta.module = module_
			} catch (error) {
				log.error(error)
			}

			const contents = router.routeMetaToString(runtime.tmpl, meta, { devMode: true })
			await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
			await fs.promises.writeFile(meta.routeInfo.dst, contents)
		}

		const req_proxy = http.request(opts, async res_proxy => {
			if (res_proxy.statusCode === 404) {
				// TODO: Do we even need this?
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			res.writeHead(res_proxy.statusCode!, res_proxy.headers)
			res_proxy.pipe(res, { end: true })
		})

		req.pipe(req_proxy, { end: true })
	})

	// // Pre-generate __export__/404.html:
	// setTimeout(async () => {
	// 	const meta404 = runtime.router["/404"]
	// 	if (meta404 !== undefined) {
	// 		const contents404 = router.renderRouteMetaToString(runtime.template, meta404, { dev: true })
	// 		await fsp.mkdir(path.dirname(meta404.routeInfo.dst), { recursive: true })
	// 		await fsp.writeFile(meta404.routeInfo.dst, contents404)
	// 	}
	// }, 0)

	server_proxy.listen(runtime.cmd.port)

	console.log(Date.now() - EPOCH)
}
