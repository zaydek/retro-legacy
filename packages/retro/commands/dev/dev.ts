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

import * as httpRouter from "./router"

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
 * Step 1: Cache and watch app.js
 * Step 2: Prerender 404.html
 * Step 3: Setup backend esbuild servedir
 * Step 4: Setup frontend HTTP server
 */

// TODO: Add support for an event hook?
export async function dev(runtime: T.Runtime<T.DevCommand>): Promise<void> {
	// // Log and export routes:
	// for (const meta of Object.values(runtime.router)) {
	// 	const start = Date.now()
	// 	events.export(runtime, meta, start)
	// }
	// console.log()

	/*
	 * Step 1: Cache and watch app.js
	 */
	const src = path.join(runtime.dirs.cacheDir, "app.js")
	const contents = router.routerToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	try {
		const dst = path.join(runtime.dirs.exportDir, src.slice(runtime.dirs.srcPagesDir.length))
		await esbuild.build({
			...esbuildHelpers.bundleConfiguration(src, dst),
			incremental: true,
			minify: false,
			watch: {
				onRebuild(error) {
					// TODO: Log event here?
					if (error !== null) {
						if (!("errors" in error) || !("warnings" in error)) throw error
						process.exit(1)
					}
				},
			},
		})
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

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
		process.exit(1)
	}

	/*
	 * Step 4: Setup frontend HTTP server
	 */
	httpRouter.handle("/~dev", (_, res) => {
		res.writeHead(200, {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		})
		// TODO
		// res.write("event")
	})

	httpRouter.handle(/^(\/app\.js|\/www\/.*)$/, (req, res) => {
		// const start = Date.now()
		const fs_path = utils.ssgify(req.url!)

		// prettier-ignore
		const opts = {
			hostname: serveResult.host,
			port:     serveResult.port,
			path:     fs_path,
			method:   req.method,
			headers:  req.headers,
		}
		const proxyReq = http.request(opts, async proxyRes => {
			// if (proxyRes.statusCode === 404) {
			// 	res.end("404 - Not Found")
			// 	events.serve({ path: fs_path, status: 404, timeInMS: Date.now() - start })
			// 	return
			// }
			res.writeHead(proxyRes.statusCode!, proxyRes.headers)
			proxyRes.pipe(res, { end: true })
		})
		req.pipe(proxyReq, { end: true })
	})

	httpRouter.handle(/^\/.*$/, async (req, res) => {
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
				// Render 404.html:
				const buffer = await fs.promises.readFile(path.join(runtime.dirs.exportDir, "404.html"))
				const contents = buffer.toString()
				res.writeHead(200, { "Content-Type": "text/html" })
				res.end(contents)
				events.serve({ path: pathname, status: 200, timeInMS: Date.now() - start })
				return
			} catch (error) {
				// Render synthetic 404.html:
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

	httpRouter.listen(runtime.cmd.port)

	console.log(
		terminal.bold(
			` ${terminal.green(">")} Ready; open ` + `${terminal.underline(`http://localhost:${runtime.cmd.port}`)}.\n`,
		),
	)
}
