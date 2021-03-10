// import * as log from "../../shared/log"

import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as events from "../events"
import * as fs from "fs"
import * as http from "http"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"
import * as utils from "../utils"

let once = false

type Request = http.IncomingMessage
type Response = http.ServerResponse

function handleDev(_: Request, res: Response): void {
	res.writeHead(200, {
		"Content-Type": "text/event-stream",
		"Cache-Control": "no-cache",
		Connection: "keep-alive",
	})
	// TODO
}

function handleWww(req: Request, res: Response, { host, port }: { host: string; port: number }): void {
	const now = Date.now()

	const opts = {
		hostname: host,
		port: port,
		path: utils.ssgify(req.url!),
		method: req.method,
		headers: req.headers,
	}

	// Create a proxy request to the esbuild servedir server:
	const proxyRequest = http.request(opts, async proxyResponse => {
		if (proxyResponse.statusCode === 404) {
			res.end("404 - Not Found")
			events.serve({ path: req.url!, status: 404, timeInMS: Date.now() - now })
			return
		}
		res.writeHead(proxyResponse.statusCode!, proxyResponse.headers)
		proxyResponse.pipe(res, { end: true })
	})

	// Forward the request to the context request:
	req.pipe(proxyRequest, { end: true })
}

function getURL(req: Request) {
	let url = req.url!
	switch (true) {
		case url.endsWith("/index.html"):
			url = url.slice(0, -"index.html".length)
			break
		case url.endsWith("/index"):
			url = url.slice(0, -"index".length) // Keep "/"
			break
		case url.endsWith(".html"):
			url = url.slice(0, -".html".length)
			break
	}
	return url
}

async function rebuildModule(runtime: T.Runtime, meta: T.ServerRouteMeta): Promise<string> {
	const src = meta.route.src
	const dst = path.join(runtime.dirs.cacheDir, meta.route.src.replace(/\..*$/, ".esbuild.js"))

	try {
		await esbuild.build(esbuildHelpers.transpileOnlyConfiguration(src, dst))
	} catch (error) {
		// TODO: Report error to user.
		throw error
	}

	try {
		// TODO: Change to path.relative so semantics are preserved.
		const path_ = path.join(process.cwd(), dst)
		meta.module = await require(path_)
		delete require.cache[require.resolve(path_)]
	} catch (error) {
		// TODO: Report error to user.
		throw error
	}

	const contents = router.routeMetaToString(runtime.tmpl, meta, { dev: true })
	await fs.promises.mkdir(path.dirname(meta.route.dst), { recursive: true })
	await fs.promises.writeFile(meta.route.dst, contents)
	return contents
}

async function handleApp(req: Request, res: Response, runtime: T.Runtime): Promise<void> {
	const start = Date.now()

	const url = getURL(req)
	const meta = runtime.router[url]
	if (meta === undefined) {
		try {
			const buffer = await fs.promises.readFile(path.join(runtime.dirs.exportDir, "404.html"))
			const contents = buffer.toString()
			res.writeHead(200, { "Content-Type": "text/html" })
			res.end(contents)
		} catch (error) {
			res.writeHead(404, { "Content-Type": "text/plain" })
			res.end("404 - Not Found")
		}
		if (!once) {
			console.log()
			once = true
		}
		events.serve({ path: url, status: 404, timeInMS: Date.now() - start })
		return
	}

	const contents = await rebuildModule(runtime, meta)
	res.writeHead(200, { "Content-Type": "text/html" })
	res.end(contents)

	if (!once) {
		console.log()
		once = true
	}
	events.serve({ path: url, status: 200, timeInMS: Date.now() - start })
}

// TODO: Add support for an event hook?
export async function dev(runtime: T.Runtime<T.DevCommand>): Promise<void> {
	// __cache__/app.js:
	const src = path.join(runtime.dirs.cacheDir, "app.js")
	const contents = router.routerToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	// __export__/app.js
	try {
		const dst = path.join(runtime.dirs.exportDir, src.slice(runtime.dirs.srcPagesDir.length))
		await esbuild.build({
			...esbuildHelpers.bundleConfiguration(src, dst),
			incremental: true,
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

	// __export/404.html
	const meta404 = runtime.router["/404"]
	if (meta404 !== undefined) {
		const contents = router.routeMetaToString(runtime.tmpl, meta404, { dev: true })
		await fs.promises.mkdir(path.dirname(meta404.route.dst), { recursive: true })
		await fs.promises.writeFile(meta404.route.dst, contents)
	}

	let serveResult: esbuild.ServeResult
	try {
		serveResult = await esbuild.serve(
			{
				// port: random(1_000, 10_000, [runtime.command.port]),
				servedir: runtime.dirs.exportDir,
				onRequest: (args: esbuild.ServeOnRequestArgs) => {
					if (!once) {
						console.log()
						once = true
					}
					events.serve(args)
				},
			},
			{},
		)
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}

	const proxyServer = http.createServer(async (req, res) => {
		// Handle "/~dev":
		const url = req.url!
		if (url === "/~dev") {
			handleDev(req, res)
			return
		}
		// Handle "/app.js" and "/www/**/*":
		if (url === "/app.js" || url.startsWith("/" + runtime.dirs.wwwDir)) {
			handleWww(req, res, { host: serveResult.host, port: serveResult.port })
			return
		}
		await handleApp(req, res, runtime)
	})

	proxyServer.listen(runtime.cmd.port)
}
