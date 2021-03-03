import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as events from "../events"
import * as fs from "fs"
import * as http from "http"
import * as log from "../../shared/log"
import * as path from "path"
import * as router from "../router"
import * as terminal from "../../shared/terminal"
import * as types from "../types"
import * as utils from "../utils"

function handleEsbuildWarnings(result: esbuild.BuildResult): void {
	if (result.warnings.length === 0) {
		// No-op
		return
	}
	for (const warning of result.warnings) {
		log.warning(esbuildHelpers.format(warning, terminal.yellow))
	}
	process.exit(1)
}

// TODO: Integrate handleEsbuildWarnings.
function handleEsbuildError(error: Error): void {
	if (error === undefined || error === null) {
		// No-op
		return
	}
	if (!("errors" in error) || !("warnings" in error)) throw error
	log.error(esbuildHelpers.format((error as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
}

// async function exportPages(runtime: types.Runtime): Promise<void> {
// 	let once = false
// 	for (const meta of Object.values(runtime.router)) {
// 		const start = Date.now()
// 		const str = await router.renderRouteMetaToString(runtime.document, meta, { devMode: false })
// 		await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
// 		await fs.promises.writeFile(meta.routeInfo.dst, str)
// 		if (!once) {
// 			console.log()
// 			once = true
// 		}
// 		events.export_(runtime, meta, start)
// 	}
// 	console.log()
// }

// Step 1: Build app.js with watch mode enabled
// Step 2: On watch, rebuild app.js
// Step 3: On HTTP requests, render and cache the current page to string and ~~rebuild app.js~~
export async function dev(runtime: types.Runtime<types.DevCommand>): Promise<void> {
	// await exportPages(runtime)

	// Build __cache__/app.js:
	const src = path.join(runtime.directories.cacheDirectory, "app.js")
	const contents = await router.renderRouterToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	// Build __export__/app.js:
	const dst = path.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length))

	let buildResult: esbuild.BuildResult
	try {
		buildResult = await esbuild.build({
			...esbuildHelpers.bundleAppConfiguration(src, dst),
			incremental: true,
			watch: {
				onRebuild(error, result): void {
					if (error !== null) handleEsbuildError(error)
					if (result !== null) handleEsbuildWarnings(result)
				},
			},
		})
	} catch (error) {
		handleEsbuildError(error)
	}

	let serveResult: esbuild.ServeResult
	try {
		serveResult = await esbuild.serve(
			{
				servedir: runtime.directories.exportDirectory,
				onRequest: (args: esbuild.ServeOnRequestArgs) => events.serve(args),
			},
			{},
		)
	} catch (error) {
		handleEsbuildError(error)
	}

	// This implementation is roughly based on:
	//
	// - https://esbuild.github.io/api/#customizing-server-behavior
	// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
	//
	const server_proxy = http.createServer((req, res) => {
		const opts = {
			hostname: serveResult.host, // Reuse servedir host
			port: serveResult.port, // Reuse servedir port
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const req_proxy = http.request(opts, res_proxy => {
			// if (req.url === "/~dev") {
			//   res.writeHead(200, {
			//   	"Content-Type": "text/event-stream",
			//   	"Cache-Control": "no-cache",
			//   	Connection: "keep-alive",
			//   })
			//   // ...
			//   return
			// }
			// TODO
			if (res_proxy.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			res.writeHead(res_proxy.statusCode!, res_proxy.headers)
			res_proxy.pipe(res, { end: true })
		})
		req.pipe(req_proxy, { end: true })
	})

	server_proxy.listen(runtime.command.port)
}
