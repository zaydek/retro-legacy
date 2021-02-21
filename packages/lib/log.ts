import * as term from "./term"

export function error(error: string | Error): void {
	if (typeof error === "string") error = new Error(error)

	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(error.message)}
`)
	} else {
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(error.message)}
`)
		console.error({ error })
	}
	process.exit(0)
}
