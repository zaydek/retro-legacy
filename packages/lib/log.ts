import * as term from "./term"

let once = false

// prettier-ignore
function formatMessage(msg: string): string {
	return msg.split("\n").map((each, x) => {
		if (x === 0) return each
		if (each === "") return each
		return " ".repeat(2) + each.replace("\t", "  ")
	}).join("\n")
}

export function info(...args: unknown[]): void {
	const message = formatMessage(args.join(" "))
	if (!once) {
		console.log(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}`)
		console.log()
	}
	console.log(`${" ".repeat(2)}${term.bold(">")} ${term.boldGreen("ok:")} ${term.bold(message)}`)
	console.log()
	once = true
}

// TODO: Can we support (...args: unknown[]) here?
export function error(error: string | Error): void {
	const message = formatMessage(typeof error === "object" ? error.message : error)

	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		if (!once) {
			console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}`)
			console.error()
		}
		console.error(`${" ".repeat(2)}${term.bold(">")} ${term.boldRed("error:")} ${term.bold(message)}`)
		console.error()
	} else {
		if (!once) {
			console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}`)
			console.error()
		}
		console.error(`${" ".repeat(2)}${term.bold(">")} ${term.boldRed("error:")} ${term.bold(message)}`)
		console.error()
		console.error({ error })
	}
	process.exit(0)
}
