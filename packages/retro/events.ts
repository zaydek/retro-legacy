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
	const src_basename = src.slice(1, -src_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - ("/" + src + " ").length))

	const dst = meta.route.dst.slice(runtime.dirs.exportDir.length)
	const dst_ext = path.extname(dst)
	const dst_basename = dst.slice(1, -dst_ext.length)

	let logstr = ""
	logstr += " " + terminal.dim(utils.current_datestr()) + "  "
	logstr += dim("/") + color(src_basename) + dim(src_ext)
	logstr += " " + dim(sep) + " "
	logstr += dim("/") + color(dst_basename) + " " + dim(`(${dur})`)
	console.log(logstr)
}

function serve(args: esbuild.ServeOnRequestArgs): void {
	const dur = formatMS(args.timeInMS)

	let color = terminal.normal
	if (args.status < 200 || args.status >= 300) {
		color = terminal.red
	}

	let dim = terminal.dim
	if (args.status < 200 || args.status >= 300) {
		dim = terminal.dim.red
	}

	let logger = (...args: unknown[]): void => console.log(...args)
	if (args.status < 200 || args.status >= 300) {
		logger = (...args) => console.error(...args)
	}

	const path_ = args.path
	const path_ext = path.extname(path_)
	const path_basename = path_.slice(1, -path_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - ("/" + path_ + " ").length))

	let logstr = ""
	logstr += " " + terminal.dim(utils.current_datestr()) + "  "
	logstr += dim("/") + color(path_basename) + dim(path_ext)
	logstr += " " + dim(sep) + " "
	logstr += color(args.status) + " " + dim(`(${dur})`)
	logger(logstr)
}

export { export_ as export, serve }
