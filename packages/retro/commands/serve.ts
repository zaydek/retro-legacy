import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as fs from "fs"
import * as http from "http"
import * as log from "../../shared/log"
import * as logEvents from "../logEvents"
import * as T from "../types"
import * as utils from "../utils"

export async function serve(r: T.Runtime<T.ServeCommand>): Promise<void> {
	try {
		await fs.promises.stat(r.directories.exportDirectory)
	} catch {
		log.error(errors.serveWithoutExportDirectory())
	}

	let once = false

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: r.directories.exportDirectory,
		onRequest: (args: esbuild.ServeOnRequestArgs) => {
			if (!once) {
				console.log()
				once = true
			}
			logEvents.serve(args)
		},
	}, {})

	// This implementation is roughly based on:
	//
	// - https://esbuild.github.io/api/#customizing-server-behavior
	// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
	//
	const server_proxy = http.createServer((req, res) => {
		const opts = {
			hostname: result.host,
			port: result.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const req_proxy = http.request(opts, res_proxy => {
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

	server_proxy.listen(r.command.port)
}
