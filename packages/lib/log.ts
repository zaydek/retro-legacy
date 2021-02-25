import * as term from "../lib/term"

// format converts tabs to spaces and adds two spaces to the start.
function format(...args: unknown[]): string {
	if (args.length === 1 && args[0] instanceof Error) {
		return format(args[0].message)
	}

	return args
		.join(" ")
		.split("\n")
		.map((each, x) => {
			// if (x === 0) return term.bold(each)
			if (x === 0) return each
			if (each === "") return each
			return "\x20" + each.replace("\t", "  ")
		})
		.join("\n")
}

// "> ok: ..."
export function ok(...args: unknown[]): void {
	const message = format(...args)
	console.log(`\x20${term.bold(">")} ${term.bold(message)}`)
	console.log()
}

// "> warning: ..."
export function warning(...args: unknown[]): void {
	const message = format(...args)
	console.warn(`\x20${term.bold(">")} ${term.bold.yellow("warning:")} ${term.bold(message)}`)
	console.warn()
}

// "> error: ..."
export function error(...args: unknown[]): void {
	const message = format(...args)
	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		console.error(`\x20${term.bold(">")} ${term.bold.red("error:")} ${term.bold(message)}`)
		console.error()
	} else {
		console.error(`\x20${term.bold(">")} ${term.bold.red("error:")} ${term.bold(message)}`)
		console.error()
	}
	process.exit(0)
}
