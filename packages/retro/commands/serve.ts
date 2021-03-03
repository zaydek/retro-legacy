import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as events from "../events"
import * as fs from "fs/promises"
import * as http from "http"
import * as log from "../../lib/log"
import * as types from "../types"
import * as utils from "../utils"

export async function serve(runtime: types.Runtime<types.ServeCommand>): Promise<void> {
	try {
		await fs.stat(runtime.directories.exportDirectory)
	} catch {
		log.error(errors.serveWithMissingExportDirectory)
	}

	// Add a serve request handler:
	let once = false
	const result = await esbuild.serve(
		{
			servedir: runtime.directories.exportDirectory,
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

	// This implementation is roughly based on:
	//
	// - https://esbuild.github.io/api/#customizing-server-behavior
	// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
	//
	const serverProxy = http.createServer((req: http.IncomingMessage, res: http.ServerResponse): void => {
		const opts = {
			hostname: result.host,
			port: result.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const requestProxy = http.request(opts, (responseProxy: http.IncomingMessage): void => {
			// Handle 404:
			if (responseProxy.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			// Handle 200:
			res.writeHead(responseProxy.statusCode!, responseProxy.headers)
			responseProxy.pipe(res, { end: true })
		})
		req.pipe(requestProxy, { end: true })
	})

	serverProxy.listen(runtime.command.port)
}
