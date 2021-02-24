import * as esbuild from "esbuild"
import * as term from "../lib/term"

interface TimeInfo {
	hh: string // e.g. "03"
	mm: string // e.g. "04"
	ss: string // e.g. "05"
	am: string // e.g. "AM"
	ms: string // e.g. "000"
}

function getTimeInfo(): TimeInfo {
	const date = new Date()
	const hh = String(date.getHours() % 12 || 12).padStart(2, "0")
	const mm = String(date.getMinutes()).padStart(2, "0")
	const ss = String(date.getSeconds()).padStart(2, "0")
	const am = date.getHours() < 12 ? "AM" : "PM"
	const ms = String(date.getMilliseconds()).slice(0, 3).padStart(3, "0")
	return { hh, mm, ss, am, ms }
}

export default function logRequest(args: esbuild.ServeOnRequestArgs): void {
	const { hh, mm, ss, am, ms } = getTimeInfo()

	const ok = args.status >= 200 && args.status < 300

	let normal = term.normal
	if (!ok) {
		normal = term.red
	}

	let dim = term.dim
	if (!ok) {
		dim = term.dim.red
	}

	const format = `\x2003:04:05.000 AM  ${args.method} ${args.path} - 200 (0ms)`
	const result = format
		.replace("03:04:05.000 AM", dim(`${hh}:${mm}:${ss}.${ms} ${am}`))
		.replace(`${args.method} ${args.path}`, normal(args.method, args.path))
		.replace(" - ", " " + dim("-" + "-".repeat(Math.max(0, 70 - format.length))) + " ")
		.replace("200", normal(args.status))
		.replace("(0ms)", dim(`(${args.timeInMS}ms)`))

	let log = (...args: unknown[]): void => console.log(...args)
	if (!ok) {
		log = (...args: unknown[]): void => console.error(...args)
	}
	log(result)
}
