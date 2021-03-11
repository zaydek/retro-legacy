import * as esbuild from "esbuild"
import * as esbuildHelpers from "../../esbuild-helpers"
import * as events from "../../events"
import * as fs from "fs"
import * as http from "http"
import * as path from "path"
import * as router from "../../router"
import * as T from "../../types"
import * as terminal from "../../../shared/terminal"
import * as utils from "../../utils"

import * as routerImpl from "./router"
import { chan, go } from "./go"
import { watcher } from "./watcher"

async function rebuildRouteMeta(runtime: T.Runtime, meta: T.ServerRouteMeta): Promise<string> {
	const src = meta.route.src
	const dst = path.join(runtime.dirs.cacheDir, meta.route.src.replace(/\..*$/, ".esbuild.js"))

	try {
		await esbuild.build(esbuildHelpers.transpileOnlyConfiguration(src, dst))
	} catch (error) {
		// TODO: Report error to user.
		throw error
	}

	try {
		meta.module = await require("./" + dst)
		delete require.cache[path.resolve("./" + dst)]
	} catch (error) {
		// TODO: Report error to user.
		throw error
	}

	const contents = router.routeMetaToString(runtime.tmpl, meta, { dev: true })
	await fs.promises.mkdir(path.dirname(meta.route.dst), { recursive: true })
	await fs.promises.writeFile(meta.route.dst, contents)
	return contents
}

////////////////////////////////////////////////////////////////////////////////

/*
 * Step 1: Watch app.js
 * Step 2: Prerender 404.html
 * Step 3: Setup backend esbuild servedir
 * Step 4: Setup frontend HTTP server
 */

// TODO: Add support for an event hook?
export async function dev(runtime: T.Runtime<T.DevCommand>): Promise<void> {
	// const srcPages = await watcher(runtime.dirs.srcPagesDir, 100)

	// let stickyBuildFailure: esbuild.BuildFailure
	// const dev = chan<esbuild.BuildFailure | null>()
	const buildFailure = chan<esbuild.BuildFailure>()

	/*
	 * Step 1: Watch app.js
	 */
	const src = path.join(runtime.dirs.cacheDir, "app.js")
	const contents = router.routerToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	const dst = path.join(runtime.dirs.exportDir, src.slice(runtime.dirs.srcPagesDir.length))

	let buildResult: esbuild.BuildResult
	try {
		buildResult = await esbuild.build({
			...esbuildHelpers.bundleConfiguration(src, dst),
			incremental: true,
			minify: false,
			watch: {
				async onRebuild(error) {
					if (error !== null) {
						if (!("errors" in error) || !("warnings" in error)) throw error
						await buildFailure.send(error)
						// stickyBuildFailure = error
						// process.exit(1)
						// if (!("errors" in error) || !("warnings" in error)) throw error
						// await dev.send(error)
					}
				},
			},
		})
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		await buildFailure.send(error)
		// stickyBuildFailure = error
	}

	// go(async () => {
	// 	while (true) {
	// 		await srcPages.recv()
	// 		await buildResult.rebuild!()
	// 		await dev.send()
	// 	}
	// })

	/*
	 * Step 2: Prerender 404.html
	 */
	const meta = runtime.router["/404"]
	if (meta !== undefined) {
		const contents = router.routeMetaToString(runtime.tmpl, meta, { dev: true })
		await fs.promises.mkdir(path.dirname(meta.route.dst), { recursive: true })
		await fs.promises.writeFile(meta.route.dst, contents)
	}

	/*
	 * Step 3: Setup backend esbuild servedir
	 */
	let serveResult: esbuild.ServeResult
	try {
		// prettier-ignore
		serveResult = await esbuild.serve({
			servedir: runtime.dirs.exportDir,
			onRequest: (args: esbuild.ServeOnRequestArgs) => events.serve(args)
		}, {})
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		// process.exit(1) // TODO
	}

	/*
	 * Step 4: Setup frontend HTTP server
	 */
	routerImpl.handle("/~dev", async (_, res) => {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		})
		while (true) {
			const error = await buildFailure.recv()
			res.write(`event: reload\ndata: ${JSON.stringify(error)}\n\n`)
		}

		// const error = await dev.recv()
		// console.log(JSON.stringify(error))
		// res.write(`event: reload\ndata: ${JSON.stringify(error)}\n\n`)
	})

	routerImpl.handle(/^(\/app\.js|\/www\/.*)$/, (req, res) => {
		const opts = {
			hostname: serveResult.host,
			port: serveResult.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const proxyReq = http.request(opts, async proxyRes => {
			res.writeHead(proxyRes.statusCode!, proxyRes.headers)
			proxyRes.pipe(res, { end: true })
		})
		req.pipe(proxyReq, { end: true })
	})

	routerImpl.handle(/^\/.*$/, async (req, res) => {
		const start = Date.now()

		// Get the current pathname:
		let pathname = req.url!
		switch (true) {
			case req.url!.endsWith("/index.html"):
				pathname = req.url!.slice(0, -"index.html".length)
				break
			case req.url!.endsWith("/index"):
				pathname = req.url!.slice(0, -"index".length) // Keep "/"
				break
			case req.url!.endsWith(".html"):
				pathname = req.url!.slice(0, -".html".length)
				break
		}

		// Render the route:
		const meta = runtime.router[pathname]
		if (meta === undefined) {
			try {
				// Render /404:
				const buffer = await fs.promises.readFile(path.join(runtime.dirs.exportDir, "404.html"))
				const contents = buffer.toString()
				res.writeHead(200, { "Content-Type": "text/html" })
				res.end(contents)
				events.serve({ path: pathname, status: 200, timeInMS: Date.now() - start })
				return
			} catch (error) {
				// Render synthetic /404:
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				events.serve({ path: pathname, status: 404, timeInMS: Date.now() - start })
				return
			}
		}

		// // TODO: We want to aggregate errors here so we can report them to the user.
		// console.log(meta)

		const contents = await rebuildRouteMeta(runtime, meta)
		res.writeHead(200, { "Content-Type": "text/html" })
		res.end(contents)
		events.serve({ path: pathname, status: 200, timeInMS: Date.now() - start })
	})

	routerImpl.listen(runtime.cmd.port)
	console.log(terminal.bold(`\x20> Ready; open ` + `${terminal.underline(`http://localhost:${runtime.cmd.port}`)}.`))
}
