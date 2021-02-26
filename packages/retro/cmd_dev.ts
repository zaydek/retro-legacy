// import * as esbuild from "esbuild"
// import * as http from "http"
import * as fs from "fs"
import * as p from "path"
import * as types from "./types"

import copyAll from "./copyAll"
import readPages from "./readPages"
import runServerGuards from "./runServerGuards"

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
	// Run server guards:
	await runServerGuards(runtime.directories)

	// Purge __export__:
	await fs.promises.rmdir(runtime.directories.exportDir, { recursive: true })
	await copyAll(runtime.directories.publicDir, p.join(runtime.directories.exportDir, runtime.directories.publicDir), [
		p.join(runtime.directories.publicDir, "index.html"),
	])

	// Read runtime.document and runtime.pages:
	const data = await fs.promises.readFile(p.join(runtime.directories.publicDir, "index.html"))
	runtime.document = data.toString()
	runtime.pages = await readPages(runtime.directories)

	//	const check = await checker("watch-src")
	//
	//	const result = await esbuild.build({
	//		bundle: true,
	//		define: { "process.env.NODE_ENV": JSON.stringify("development") },
	//		entryPoints: ["watch-src/component.js"],
	//		incremental: true,
	//		loader: { ".js": "jsx" },
	//		outfile: "component.esbuild.js",
	//	})
	//
	//	const router: { [key: string]: { route: {}; props: {} } } = {
	//		"/": {
	//			route: {},
	//			props: {},
	//		},
	//		"/pikachu": {
	//			route: {},
	//			props: {},
	//		},
	//	}
	//
	//	async function exportPage(runtime: unknown, meta: unknown): Promise<string> {
	//		return "Hello, world!"
	//	}
	//
	//	const cache: {
	//		[key: string]: {
	//			modTime: number
	//			exportedPage: string
	//			// Head?: (serverProps: unknown):
	//		}
	//	} = {}
	//
	//	const server = http.createServer(async (req, res) => {
	//		// // Bad requests:
	//		// if (router[req.url!] === undefined) {
	//		// 	res.writeHead(404, { "Content-Type": "text/plain" })
	//		// 	res.end("404 - Not Found")
	//		// 	return
	//		// }
	//		// // Respond from the cache:
	//		// const stat = await fs.promises.stat(req.url!)
	//		// const cached = cache[req.url!]
	//		// if (cached !== undefined && cached.modTime !== stat.mtimeMs) {
	//		// 	res.writeHead(200, { "Content-Type": "text/html" })
	//		// 	res.end(cached.exportedPage)
	//		// 	return
	//		// }
	//		// // Re-export and cache:
	//		// const exportedPage = await exportPage({}, router[req.url!]!)
	//		// cache[req.url!] = {
	//		// 	modTime: stat.mtimeMs,
	//		// 	exportedPage,
	//		// }
	//		// res.writeHead(200, { "Content-Type": "text/html" })
	//		// res.end(exportedPage)
	//	})
	//	server.listen("8000")
	//
	//	console.log("hello, world!")
	//
	//	// When the user navigates to page, export it.
	//	setInterval(async () => {
	//		const path = await check()
	//		if (path !== "") {
	//			// // Dedupe watch events:
	//			// const stat = await fs.promises.stat(path)
	//			// if (stat.isDirectory()) return
	//
	//			// TODO: Emit a server-sent event here.
	//			console.log(`${path} changed`)
	//			await result.rebuild()
	//		}
	//	}, POLL_INTERVAL)
}

export default cmd_dev
