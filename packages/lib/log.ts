import * as term from "./term"

// prettier-ignore
function formatMessage(msg: string): string {
	return msg.split("\n").map((each, x) => {
		if (x > 0 && each.length > 0) {
			return " ".repeat(2) + each
		}
		return each
	}).join("\n")
}

export function info(...args: unknown[]): void {
	const message = formatMessage(args.join(" "))

	console.log(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldGreen("ok:")} ${term.bold(message)}
`)
}

export function error(error: string | Error): void {
	const message = formatMessage(typeof error === "object" ? error.message : error)

	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(message)}
`)
	} else {
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(message)}
`)
		console.error({ error })
	}
	process.exit(0)
}
