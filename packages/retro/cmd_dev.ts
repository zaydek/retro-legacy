// import * as esbuild from "esbuild"
// import * as fs from "fs"
// import * as http from "http"
// import * as p from "path"

import * as http from "http"
import * as types from "./types"
import * as utils from "./utils"

async function exportPage(runtime: unknown, meta: unknown): Promise<string> {
	return "Hello, world!"
}

// On start, cache the server-side props and paths.
// - We need to know server props for Head(serverProps) and Page(serverProps)
// - We need to know paths / server paths for the HTTP server (respond 200 or 404)
//
// On 200 paths, export (w/ serverProps), cache, and serve the page
// - Use a cache based on mtime to no-op idempotent requests
// - Emit serve-sent events on esbuild warnings and errors
//
// On watch events, rebuild app.js and emit server-sent events (refresh, esbuild warnings and errors)
//
const cmd_dev: types.cmd_dev = async runtime => {
	// const cache: {
	// 	[key: string]: {
	// 		modTime: number
	// 		exportedPage: string
	// 		// Head?: (serverProps: unknown):
	// 	}
	// } = {}

	let callback: () => void | undefined

	// Resolve router:
	const router: { [key: string]: { route: {}; props: {} } } = {
		"/": {
			route: {},
			props: {},
		},
		"/pikachu": {
			route: {},
			props: {},
		},
	}
	const cache: { [key: string]: unknown } = {}

	// Resolve app.js:
	//	const result = await esbuild.build({
	//		bundle: true,
	//		define: { "process.env.NODE_ENV": JSON.stringify("development") },
	//		entryPoints: ["watch-src/component.js"],
	//		incremental: true,
	//		loader: { ".js": "jsx" },
	//		outfile: "component.esbuild.js",
	//	})

	async function watch(): Promise<void> {
		const generator = utils.watcher("src", { interval: 100 })
		async function next(): Promise<string> {
			return (await generator.next()).value
		}
		while (true) {
			const src = await next()
			if (src !== "") {
				if (callback) callback()
			}
		}
	}

	watch()

	const server = http.createServer(
		async (request: http.IncomingMessage, response: http.ServerResponse): Promise<void> => {
			// Handle server-sent events:
			if (request.url === "/~dev") {
				callback = (): void => {
					// TODO: Log a custom event here.
					response.write("event: reload\n\n")
				}
				response.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
				return
			}

			// // Bad requests:
			// if (router[request.url!] === undefined) {
			// 	response.writeHead(404, { "Content-Type": "text/plain" })
			// 	response.end("404 - Not Found")
			// 	return
			// }
			// // Respond from the cache:
			// const stat = await fs.promises.stat(request.url!)
			// const cached = cache[request.url!]
			// if (cached !== undefined && cached.modTime !== stat.mtimeMs) {
			// 	response.writeHead(200, { "Content-Type": "text/html" })
			// 	response.end(cached.exportedPage)
			// 	return
			// }
			// // Re-export and cache:
			// const exportedPage = await exportPage({}, router[request.url!]!)
			// cache[request.url!] = {
			// 	modTime: stat.mtimeMs,
			// 	exportedPage,
			// }
			// response.writeHead(200, { "Content-Type": "text/html" })
			// response.end(exportedPage)
		},
	)
	server.listen("8000")
}

export default cmd_dev
