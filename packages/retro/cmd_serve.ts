import * as errs from "./errs"
import * as esbuild from "esbuild"
import * as events from "./events"
import * as fs from "fs"
import * as http from "http"
import * as log from "../lib/log"
import * as types from "./types"
import * as utils from "./utils"

// This implementation is roughly based on:
//
// - https://esbuild.github.io/api/#customizing-server-behavior
// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
//
export default async function cmd_serve(runtime: types.Runtime<types.ServeCommand>): Promise<void> {
	try {
		await fs.promises.stat("__export__")
	} catch {
		log.error(errs.serveWithoutExport)
	}

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: runtime.directories.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => events.serve(args),
	}, {})

	const srvProxy = http.createServer((req: http.IncomingMessage, res: http.ServerResponse): void => {
		const options = {
			hostname: result.host,
			port: result.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const reqProxy = http.request(options, (resProxy: http.IncomingMessage): void => {
			// Handle 404:
			if (resProxy.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			// Handle 200:
			res.writeHead(resProxy.statusCode!, resProxy.headers)
			resProxy.pipe(res, { end: true })
		})
		req.pipe(reqProxy, { end: true })
	})
	srvProxy.listen(runtime.command.port)
}
