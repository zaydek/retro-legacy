import * as esbuild from "esbuild"
import * as p from "path"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

const TERM_WIDTH = 40

const formatter = utils.newFormatter()

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

export function export_(runtime: types.Runtime, meta: types.RouteMeta, start: number): void {
	const dur = formatMS(Date.now() - start)

	const l1 = runtime.directories.srcPagesDirectory.length
	const l2 = runtime.directories.exportDirectory.length

	let color = term.white
	if (meta.route.type === "dynamic") {
		color = term.cyan
	}

	let dimColor = term.dim.white
	if (meta.route.type === "dynamic") {
		dimColor = term.dim.cyan
	}

	const src = meta.route.src.slice(l1)
	const src_ext = p.extname(src)
	const src_name = src.slice(1, -src_ext.length)

	const dst = meta.route.dst.slice(l2)
	const dst_ext = p.extname(dst)
	const dst_name = dst.slice(1, -dst_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${src_name}${src_ext}\x20`.length))

	formatter.format()
	console.log(
		`\x20${term.dim(utils.timestamp())}\x20\x20` +
			`${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep)} ${dimColor("/")}${color(dst_name)}${
				start === 0 ? "" : ` ${dimColor(`(${dur})`)}`
			}`,
	)
}

export function serve(args: esbuild.ServeOnRequestArgs): void {
	const dur = formatMS(args.timeInMS)

	let color = term.normal
	if (args.status < 200 || args.status >= 300) {
		color = term.red
	}

	let dimColor = term.dim
	if (args.status < 200 || args.status >= 300) {
		dimColor = term.dim.red
	}

	let logger = (...args: unknown[]): void => console.log(...args)
	if (args.status < 200 || args.status >= 300) {
		logger = (...args) => console.error(...args) // eslint-disable-line
	}

	const path = args.path
	const path_ext = p.extname(path)
	const path_name = path.slice(1, -path_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext}\x20`.length))

	formatter.format()
	logger(
		`\x20${term.dim(utils.timestamp())}\x20\x20` +
			`${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep)} ${color(args.status)} ${dimColor(
				`(${dur})`,
			)}`,
	)
}
