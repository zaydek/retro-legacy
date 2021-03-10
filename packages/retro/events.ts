import * as esbuild from "esbuild"
import * as path from "path"
import * as T from "./types"
import * as terminal from "../shared/terminal"
import * as utils from "./utils"

const TERM_WIDTH = 40

function formatMS(ms: number): string {
	switch (true) {
		case ms < 250:
			// 250ms
			return `${ms}ms`
		default:
			// 0.25ms
			return `${(ms / 1e3).toFixed(2)}s`
	}
}

// TODO: Add support for bytes.
function export_(runtime: T.Runtime, meta: T.ServerRouteMeta, start: number): void {
	const dur = formatMS(Date.now() - start)

	let color = terminal.white
	if (meta.route.type === "dynamic") {
		color = terminal.cyan
	}

	let dim = terminal.dim.white
	if (meta.route.type === "dynamic") {
		dim = terminal.dim.cyan
	}

	const src = meta.route.src.slice(runtime.dirs.srcPagesDir.length)
	const src_ext = path.extname(src)
	const src_name = src.slice(1, -src_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - ("/" + src + " ").length))

	const dst = meta.route.dst.slice(runtime.dirs.exportDir.length)
	const dst_extname = path.extname(dst)
	const dst_name = dst.slice("/".length, -dst_extname.length)

	let logstr = ""
	logstr += " " + terminal.dim(utils.current_datestr()) + "  "
	logstr += dim("/") + color(src_name) + dim(src_ext)
	logstr += " " + dim(sep) + " "
	logstr += dim("/") + color(dst_name) + " " + dim(`(${dur})`)
	console.log(logstr)
}

// Based on esbuild.ServeOnRequestArgs.
//
// TODO: Add support for bytes.
interface ServeArgs {
	path: string
	status: number
	timeInMS: number
}

type Logger = (...args: unknown[]) => void

function serve(args: ServeArgs): void {
	let logger: Logger = (...args) => console.log(...args)
	if (args.status < 200 || args.status >= 300) {
		logger = (...args) => console.error(...args)
	}

	const dur = formatMS(args.timeInMS)

	let color = terminal.normal
	if (args.status < 200 || args.status >= 300) {
		color = terminal.red
	}

	let dim = terminal.dim
	if (args.status < 200 || args.status >= 300) {
		dim = terminal.dim.red
	}

	const path_ = args.path
	const path_extname = path.extname(path_)
	let path_name = path_.slice("/".length)
	if (path_extname.length > 0) {
		path_name = path_.slice("/".length, -path_extname.length /* Must be greater than 0 */)
	}

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - (path_ + " ").length))

	let logstr = ""
	logstr += " " + terminal.dim(utils.current_datestr()) + "  "
	logstr += dim("/") + color(path_name) + dim(path_extname)
	logstr += " " + dim(sep) + " "
	logstr += color(args.status) + " " + dim(`(${dur})`)

	logger(logstr)
}

export { export_ as export, serve }
