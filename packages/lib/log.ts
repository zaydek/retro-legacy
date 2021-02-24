import * as term from "../lib/term"

let once = false

// format converts tabs to spaces and adds two spaces to the start.
function format(...args: unknown[]): string {
	if (args.length === 1 && args[0] instanceof Error) {
		return format(args[0].message)
	}

	return args
		.join(" ")
		.split("\n")
		.map((each, x) => {
			if (x === 0) return each
			if (each === "") return each
			return " ".repeat(2) + each.replace("\t", "  ")
		})
		.join("\n")
}

// "> ok: ..."
export function ok(...args: unknown[]): void {
	const message = format(...args)
	if (!once) console.log()
	console.log(`\x20\x20${term.bold(">")} ${term.bold.green("ok:")} ${term.bold(message)}`)
	console.log()
	once = true
}

// "> warning: ..."
export function warning(...args: unknown[]): void {
	const message = format(...args)
	if (!once) console.warn()
	console.warn(`\x20\x20${term.bold(">")} ${term.bold.yellow("warning:")} ${term.bold(message)}`)
	console.warn()
	once = true
}

// "> error: ..."
export function error(...args: unknown[]): void {
	const message = format(...args)
	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		if (!once) console.error()
		console.error(`\x20\x20${term.bold(">")} ${term.bold.red("error:")} ${term.bold(message)}`)
		console.error()
	} else {
		if (!once) console.error()
		console.error(`\x20\x20${term.bold(">")} ${term.bold.red("error:")} ${term.bold(message)}`)
		console.error()
	}
	process.exit(0)
}
