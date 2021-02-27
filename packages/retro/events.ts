import * as esbuild from "esbuild"
import * as p from "path"
import * as term from "../lib/term"
import * as types from "./types"

const TERM_WIDTH = 40

// let once = false

function timestamp(): string {
	const date = new Date()
	const hh = String(date.getHours() % 12 || 12).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")
	const am = date.getHours() < 12 ? "AM" : "PM"
	const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0")
	return `${hh}:${mm}:${ss}.${ms} ${am}`
}

function formatMs(ms: number): string {
	switch (true) {
		case ms < 250:
			return `${ms}ms`
		default:
			return `${(ms / 1e3).toFixed(2)}s`
	}
}

export function export_(runtime: types.Runtime, meta: types.RouteMeta, start: number): void {
	const dur = formatMs(Date.now() - start)

	const l1 = runtime.directories.srcPagesDir.length
	const l2 = runtime.directories.exportDir.length

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

	// if (!once) {
	// 	console.log()
	// 	once = true
	// }
	console.log(
		`\x20${term.dim(timestamp())}\x20\x20` +
			`${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep)} ${dimColor("/")}${color(dst_name)}${
				start === 0 ? "" : ` ${dimColor(`(${dur})`)}`
			}`,
	)
}

export function serve(args: esbuild.ServeOnRequestArgs): void {
	type Logger = (...args: unknown[]) => void

	const dur = formatMs(args.timeInMS)

	let color = term.normal
	if (args.status < 200 || args.status >= 300) {
		color = term.red
	}

	let dimColor = term.dim
	if (args.status < 200 || args.status >= 300) {
		dimColor = term.dim.red
	}

	let logger: Logger = (...args) => console.log(...args)
	if (args.status < 200 || args.status >= 300) {
		logger = (...args) => console.error(...args) // eslint-disable-line
	}

	const path = args.path
	const path_ext = p.extname(path)
	const path_name = path.slice(1, -path_ext.length)

	const sep = "-".repeat(Math.max(0, TERM_WIDTH - `/${path_name}${path_ext}\x20`.length))

	// if (!once) {
	// 	console.log()
	// 	once = true
	// }
	logger(
		`\x20${term.dim(timestamp())}\x20\x20` +
			`${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep)} ${color(args.status)} ${dimColor(
				`(${dur})`,
			)}`,
	)
}
