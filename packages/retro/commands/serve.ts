import * as errors from "../errors"
import * as esbuild from "esbuild"
import * as events from "../events"
import * as fs from "fs"
import * as http from "http"
import * as log from "../../shared/log"
import * as T from "../types"
import * as terminal from "../../shared/terminal"
import * as utils from "../utils"

// TODO: Add support for an event hook?
export async function serve(runtime: T.Runtime<T.ServeCommand>): Promise<void> {
	try {
		await fs.promises.stat(runtime.dirs.exportDir)
	} catch {
		log.fatal(errors.serveWithoutExportDirectory())
	}

	let once = false

	// prettier-ignore
	const serveResult = await esbuild.serve({
		servedir: runtime.dirs.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => {
			if (!once) {
				console.log()
				once = true
			}
			events.serve(args)
		},
	}, {})

	// This implementation is roughly based on:
	//
	// - https://esbuild.github.io/api/#customizing-server-behavior
	// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
	//
	const proxySrv = http.createServer((req, res) => {
		const opts = {
			hostname: serveResult.host,
			port: serveResult.port,
			path: utils.ssgify(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const proxyReq = http.request(opts, proxyRes => {
			if (proxyRes.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			res.writeHead(proxyRes.statusCode!, proxyRes.headers)
			proxyRes.pipe(res, { end: true })
		})
		req.pipe(proxyReq, { end: true })
	})

	proxySrv.listen(runtime.cmd.port)

	console.log(
		terminal.bold(
			` ${terminal.green(">")} Ready; open ` + `${terminal.underline(`http://localhost:${runtime.cmd.port}`)}.\n`,
		),
	)
}
