import * as esbuild from "esbuild"
import * as p from "path"
import * as term from "../../lib/term"
import * as types from "../types"

interface TimeInfo {
	hh: string // e.g. "03"
	mm: string // e.g. "04"
	ss: string // e.g. "05"
	am: string // e.g. "AM"
	ms: string // e.g. "000"
}

const TERM_WIDTH = 35

function getTimeInfo(): TimeInfo {
	const date = new Date()
	const hh = String(date.getHours() % 12 || 12).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")
	const am = date.getHours() < 12 ? "AM" : "PM"
	const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0")
	return { hh, mm, ss, am, ms }
}

function formatMs(ms: number): string {
	switch (true) {
		case ms < 250:
			return `${ms}ms` // `${String(ms).padStart(3, "0")}ms`
		default:
			return `${(ms / 1e3).toFixed(2)}s`
	}
}

let once = false

export function serveEvent(args: esbuild.ServeOnRequestArgs): void {
	type Logger = (...args: unknown[]) => void

	const { hh, mm, ss, am, ms } = getTimeInfo()

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

	if (!once) {
		logger()
		once = true
	}
	logger(
		`\x20${term.dim(`${hh}:${mm}:${ss}.${ms} ${am}`)}\x20\x20` +
			`${dimColor("/")}${color(path_name)}${dimColor(path_ext)} ${dimColor(sep)} ${color(args.status)} ${dimColor(
				`(${dur})`,
			)}`,
	)
}

export function exportEvent(runtime: types.Runtime, meta: types.RouteMeta, start: number): void {
	const { hh, mm, ss, am, ms } = getTimeInfo()

	const dur = formatMs(Date.now() - start)

	// TODO: If we make directories a global variable, we can just reference the
	// global object.
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

	console.log(
		`\x20${term.dim(`${hh}:${mm}:${ss}.${ms} ${am}`)}\x20\x20` +
			`${dimColor("/")}${color(src_name)}${dimColor(src_ext)} ${dimColor(sep)} ${dimColor("/")}${color(
				dst_name,
			)}${dimColor(dst_ext)}${start === 0 ? "" : ` ${dimColor(`(${dur})`)}`}`,
	)
}
