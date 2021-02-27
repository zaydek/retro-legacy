import * as esbuild from "esbuild"
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

interface ExportCache {
	[key: string]: {
		mtimeMs: number
		html: string
	}
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
export default async function retro_dev(runtime: types.Runtime<types.DevCommand>): Promise<void> {
	await preflight(runtime)

	//////////////////////////////////////////////////////////////////////////////

	// TODO: Implement '---cache' here.
	const router = await resolvers.resolveServerRouter(runtime)

	const appContents = await resolversText.renderServerRouterToString(runtime, router)
	const appContentsPath = p.join(runtime.directories.cacheDir, "app.js")
	await fs.promises.writeFile(appContentsPath, appContents)

	try {
		const result = await esbuild.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			},
			entryPoints: [appContentsPath],
			inject: ["packages/retro/react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			minify: true,
			outfile: p.join(runtime.directories.exportDir, appContentsPath.slice(runtime.directories.srcPagesDir.length)),
			// plugins: [...configs.retro.plugins], // TODO
		})
		// TODO: Add support for hints.
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

	//////////////////////////////////////////////////////////////////////////////

	// cache caches HTML based on '(await fs.promises.stat(...)).mtimeMs'.
	const cache: ExportCache = {}

	let callback: () => void | undefined

	// TODO: Generate server router here.
	// TODO: Implement esbuild here.

	async function watch(): Promise<void> {
		const generator = utils.watcher("src", { interval: 100 })
		async function next(): Promise<string> {
			return (await generator.next()).value
		}

		while (true) {
			await next()

			// TODO: Regenerate server router here.
			// TODO: Implement esbuild here.

			if (callback) callback()
		}
	}

	watch()

	const srv = http.createServer(
		async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
			// Server-sent events:
			if (req.url === "/~dev") {
				callback = (): void => {
					// TODO: Emit a log event here.
					res.write("event: reload\n\n")
				}
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
				return
			}

			// Bad path:
			if (router[req.url!] === undefined) {
				// TODO: Emit a log event here.
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			// Read from the cache:
			const stat = await fs.promises.stat(req.url!)
			const read = cache[req.url!]
			if (read !== undefined && read.mtimeMs !== stat.mtimeMs) {
				res.writeHead(200, { "Content-Type": "text/html" })
				res.end(read.html)
				return
			}

			// // Bad cache read; rerender and cache:
			// const html = await renderToString() // TODO
			// cache[req.url!] = {
			// 	mtimeMs: stat.mtimeMs,
			// 	html,
			// }
			// // TODO: Emit a log event here (incl. read from the cache or not).
			// res.writeHead(200, { "Content-Type": "text/html" })
			// res.end(html)
		},
	)
	srv.listen(runtime.command.port)
}
