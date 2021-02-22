import * as esbuild from "esbuild"
import * as http from "http"
import * as log from "../../lib/log"
import * as p from "path"
import * as term from "../../lib/term"
import * as types from "../types"
import * as utils from "../utils"

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
const handleServe: types.handleServe = async runtime => {
	setTimeout(() => {
		if (utils.getWillEagerlyTerminate()) return
		utils.clearScreen()
		log.info(`http://localhost:${runtime.cmd.port}`)
	}, 10)

	// prettier-ignore
	const result = await esbuild.serve({
		servedir: runtime.dir.exportDir,
		onRequest: (args: esbuild.ServeOnRequestArgs) => {
			let descriptMs = args.timeInMS + "ms"
			if (args.status >= 200 && args.status < 300 && args.timeInMS === 0) {
				descriptMs += " - cached"
			}
			console.log(`  ${term.bold("→")} ${args.method} ${args.path} ${args.status >= 200 && args.status < 300 ? term.green(args.status) : term.red(args.status)} (${descriptMs})`)
		},
	}, {})

	let transformURL = ssgify
	if (runtime.cmd.mode === "spa") {
		transformURL = spaify
	}

	// The proxy server.
	const proxySrv = http.createServer((req, res) => {
		// The proxy request.
		const proxyReq = http.request({ ...req, path: transformURL(req.url!), port: result.port }, proxyRes => {
			// The proxy response.
			if (proxyRes.statusCode === 404) {
				res.writeHead(200, { "Content-Type": "text/plain" })
				res.end("404 page not found")
			} else {
				res.writeHead(proxyRes.statusCode!, proxyRes.headers)
				proxyRes.pipe(res, { end: true })
			}
		})
		req.pipe(proxyReq, { end: true })
	})
	proxySrv.listen(runtime.cmd.port)
}

export default handleServe
