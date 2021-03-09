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

function export_(r: T.Runtime, meta: T.RouteMeta, start: number): void {
	const dur = formatMS(Date.now() - start)

	let color = terminal.white
	if (meta.routeInfo.type === "dynamic") {
		color = terminal.cyan
	}

	let dim = terminal.dim.white
	if (meta.routeInfo.type === "dynamic") {
		dim = terminal.dim.cyan
	}

	const src = meta.routeInfo.src.slice(r.directories.srcPagesDirectory.length)
	const src_ext = path.extname(src)
	const src_basename = src.slice(1, -src_ext.length)

	const dst = meta.routeInfo.dst.slice(r.directories.exportDirectory.length)
	const dst_ext = path.extname(dst)
	const dst_basename = dst.slice(1, -dst_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - ("/" + src + " ").length))

	let logstr = ""
	logstr += " " + terminal.dim(utils.getCurrentPrettyDate()) + "  "
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
		logger = (...args) => console.error(...args) // eslint-disable-line
	}

	// TODO: Change to PathInfo implementation?
	const path_ = args.path
	const path_ext = path.extname(path_)
	const path_basename = path_.slice(1, -path_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_basename}${path_ext}\x20`.length))

	// TODO: Clean this up. This is way too hard to read.
	const datestr = terminal.dim(utils.getCurrentPrettyDate())
	logger(
		`\x20${datestr}\x20\x20` +
			`${dim("/")}${color(path_basename)}${dim(path_ext)} ${dim(sep)} ${color(args.status)} ${dim(`(${dur})`)}`,
	)
}

export { export_ as export, serve }
