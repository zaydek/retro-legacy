import * as esbuild from "esbuild"
import * as fs from "fs"
import * as http from "http"
import * as log from "../lib/log"
import * as p from "path"
import * as types from "./types"

import chalk from "chalk"
import logRequest from "./logRequest"

// spaify converts a URL for SPA-mode.
function spaify(_: string): string {
	return "/"
}

// ssgify converts a URL for SSG-mode.
function ssgify(url: string): string {
	if (url.endsWith("/")) return url + "index.html"
	if (p.extname(url) === "") return url + ".html"
	return url
}

// This implementation is roughly based on:
//
// - https://esbuild.github.io/api/#customizing-server-behavior
// - https://github.com/evanw/esbuild/issues/858#issuecomment-782814216
//
const serve: types.cmd_serve = async runtime => {
	try {
		await fs.promises.stat("__export__")
	} catch {
		log.error(
			`It looks like you’re trying to run 'retro serve' before 'retro export'. Try 'retro export && retro serve'.`,
		)
	}

	setTimeout(() => {
		log.ok(`${chalk.underline(`http://localhost:${runtime.command.port}`)}`)
	}, 25)

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: runtime.directories.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => logRequest(args),
	}, {})

	let transformURL = ssgify
	if (runtime.command.mode === "spa") {
		transformURL = spaify
	}

	const proxySrv = http.createServer((req, res) => {
		const options = {
			hostname: result.host,
			port: result.port,
			path: transformURL(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const proxyReq = http.request(options, proxyRes => {
			// Bad request:
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
	proxySrv.listen(runtime.command.port)
}

export default serve
