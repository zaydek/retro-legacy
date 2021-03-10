import * as terminal from "./terminal"

const EOF = "\n"

// format converts tabs to spaces and adds two spaces to the start.
//
// TODO: Implement accent here.
function format(...args: unknown[]): string {
	// For errors, extract error.message:
	if (args.length === 1 && args[0] instanceof Error) {
		const error = args[0]
		return format(error.message)
	}

	const str = args.join(" ")
	return str
		.split("\n")
		.map((substr, x) => {
			if (x === 0 || substr === "") return substr
			return "\x20" + substr.replace(/\t/g, "\x20\x20") // Tabs -> spaces
		})
		.join("\n")
}

// ok logs an error message that appears as "> ok: ...".
export function ok(...args: unknown[]): void {
	const message = format(...args)
	console.log(`\x20${terminal.bold(">")} ${terminal.bold(message)}${EOF}`)
}

// warning logs an error message that appears as "> warning: ...".
export function warning(...args: unknown[]): void {
	const message = format(...args)
	console.warn(`\x20${terminal.bold(">")} ${terminal.bold.yellow("warning:")} ${terminal.bold(message)}${EOF}`)
}

// fatal logs an error message that appears as "> error: ...".
export function fatal(...args: unknown[]): void {
	const message = format(...args)
	console.error(`\x20${terminal.bold(">")} ${terminal.bold.red("error:")} ${terminal.bold(message)}${EOF}`)
	process.exit(1)
}
