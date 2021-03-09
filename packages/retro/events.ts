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

export function export_(runtime: T.Runtime, meta: T.RouteMeta, start: number): void {
	const dur = formatMS(Date.now() - start)

	const l1 = runtime.directories.srcPagesDirectory.length
	const l2 = runtime.directories.exportDirectory.length

	let color = terminal.white
	if (meta.routeInfo.type === "dynamic") {
		color = terminal.cyan
	}

	let dimColor = terminal.dim.white
	if (meta.routeInfo.type === "dynamic") {
		dimColor = terminal.dim.cyan
	}

	const src = meta.routeInfo.src.slice(l1)
	const src_ext = path.extname(src)
	const src_name = src.slice(1, -src_ext.length)

	const dst = meta.routeInfo.dst.slice(l2)
	const dst_ext = path.extname(dst)
	const dst_name = dst.slice(1, -dst_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${src_name}${src_ext}\x20`.length))

	// TODO: Clean this up. This is way too hard to read.
	const timestamp = terminal.dim(utils.prettyCurrentDate())
	console.log(
		`\x20${timestamp}\x20\x20` +
			`${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep)} ${dimColor("/")}${color(dst_name)}${
				start === 0 ? "" : ` ${dimColor(`(${dur})`)}`
			}`,
	)
}

export function serve(args: esbuild.ServeOnRequestArgs): void {
	const dur = formatMS(args.timeInMS)

	let color = terminal.normal
	if (args.status < 200 || args.status >= 300) {
		color = terminal.red
	}

	let dimColor = terminal.dim
	if (args.status < 200 || args.status >= 300) {
		dimColor = terminal.dim.red
	}

	let logger = (...args: unknown[]): void => console.log(...args)
	if (args.status < 200 || args.status >= 300) {
		logger = (...args) => console.error(...args) // eslint-disable-line
	}

	const path_ = args.path
	const path_ext = path.extname(path_)
	const path_name = path_.slice(1, -path_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext}\x20`.length))

	// TODO: Clean this up. This is way too hard to read.
	const timestamp = terminal.dim(utils.prettyCurrentDate())
	logger(
		`\x20${timestamp}\x20\x20` +
			`${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep)} ${color(args.status)} ${dimColor(
				`(${dur})`,
			)}`,
	)
}
