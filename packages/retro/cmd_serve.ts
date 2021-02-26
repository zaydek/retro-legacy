import * as errs from "./errs"
import * as esbuild from "esbuild"
import * as fs from "fs"
import * as http from "http"
import * as log from "../lib/log"
import * as loggers from "./utils/logTypes"
import * as p from "path"
import * as types from "./types"

// spaify converts a URL for SPA-mode.
//
// TODO: Write tests.
function spaify(_: string): string {
	return "/"
}

// ssgify converts a URL for SSG-mode.
//
// TODO: Write tests.
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
		log.error(errs.serveWithoutExport)
	}

	// setTimeout(() => {
	// 	console.log()
	// 	log.ok(term.underline(`http://localhost:${runtime.command.port}`))
	// }, 25)

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: runtime.directories.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => loggers.serveEvent(args),
	}, {})

	let transformURL = ssgify
	if (runtime.command.mode === "spa") {
		transformURL = spaify
	}

	const srvProxy = http.createServer((req, res) => {
		const options = {
			hostname: result.host,
			port: result.port,
			path: transformURL(req.url!),
			method: req.method,
			headers: req.headers,
		}
		const reqProxy = http.request(options, resProxy => {
			// Bad request:
			if (resProxy.statusCode === 404) {
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				return
			}
			res.writeHead(resProxy.statusCode!, resProxy.headers)
			resProxy.pipe(res, { end: true })
		})
		req.pipe(reqProxy, { end: true })
	})
	srvProxy.listen(runtime.command.port)
}

export default serve

//// TODO: Write tests.
