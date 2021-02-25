import * as esbuild from "esbuild"
import * as fs from "fs"
import * as http from "http"
import * as p from "path"
import * as types from "./types"

// TODO: Add as a CLI argument?
const POLL_INTERVAL = 250

// function sleep(forMs: number): Promise<void> {
// 	return new Promise(resolve => {
// 		setTimeout(() => {
// 			resolve()
// 		}, forMs)
// 	})
// }

// checker returns a function that checks whether sources have changed.
async function checker(src: string): Promise<() => Promise<string>> {
	const modTimes: { [key: string]: number } = {}

	// check checks whether sources have changed.
	const check = async (entry: string, { deep }: { deep: boolean }): Promise<string> => {
		const stat = await fs.promises.stat(entry)
		// Check for changes:
		const modTime = modTimes[entry]
		if (modTime === undefined || stat.mtimeMs !== modTime) {
			modTimes[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		// Recurse on directories:
		if (stat.isDirectory()) {
			for (const nested of await fs.promises.readdir(entry)) {
				const next = p.join(entry, nested)
				const result = await check(next, { deep })
				if (result !== "") {
					if (!deep) {
						return result
					}
				}
			}
		}
		return ""
	}

	await check(src, { deep: true })
	return async (): Promise<string> => await check(src, { deep: false })
}

// async function createRouter() {
// 	// ...
// }

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
async function run(): Promise<void> {
	const check = await checker("watch-src")

	const result = await esbuild.build({
		bundle: true,
		define: { "process.env.NODE_ENV": JSON.stringify("development") },
		entryPoints: ["watch-src/component.js"],
		incremental: true,
		loader: { ".js": "jsx" },
		outfile: "component.esbuild.js",
	})

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

	async function exportPage(runtime: unknown, meta: unknown): Promise<string> {
		return "Hello, world!"
	}

	const cache: {
		[key: string]: {
			modTime: number
			exportedPage: string
			// Head?: (serverProps: unknown):
		}
	} = {}

	const server = http.createServer(async (req, res) => {
		// // Bad requests:
		// if (router[req.url!] === undefined) {
		// 	res.writeHead(404, { "Content-Type": "text/plain" })
		// 	res.end("404 - Not Found")
		// 	return
		// }
		// // Respond from the cache:
		// const stat = await fs.promises.stat(req.url!)
		// const cached = cache[req.url!]
		// if (cached !== undefined && cached.modTime !== stat.mtimeMs) {
		// 	res.writeHead(200, { "Content-Type": "text/html" })
		// 	res.end(cached.exportedPage)
		// 	return
		// }
		// // Re-export and cache:
		// const exportedPage = await exportPage({}, router[req.url!]!)
		// cache[req.url!] = {
		// 	modTime: stat.mtimeMs,
		// 	exportedPage,
		// }
		// res.writeHead(200, { "Content-Type": "text/html" })
		// res.end(exportedPage)
	})
	server.listen("8000")

	console.log("hello, world!")

	// When the user navigates to page, export it.
	setInterval(async () => {
		const path = await check()
		if (path !== "") {
			// // Dedupe watch events:
			// const stat = await fs.promises.stat(path)
			// if (stat.isDirectory()) return

			// TODO: Emit a server-sent event here.
			console.log(`${path} changed`)
			await result.rebuild()
		}
	}, POLL_INTERVAL)
}

run()
