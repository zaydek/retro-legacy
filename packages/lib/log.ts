import * as term from "./term"

// (Use STACK_TRACE=true ... to see the stack trace)
export function error(err: Error | string): void {
	const STACK_TRACE = process.env["STACK_TRACE"] === "true"

	if (typeof err === "string" || !STACK_TRACE) {
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(err)}
`)
	} else {
		const stack = (err as { stack: string }).stack
		// prettier-ignore
		console.error(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldRed("error:")} ${term.bold(err.message)}

	${stack.split("\n").map(line => " ".repeat(2) + line).join("\n")}
`)
	}
	process.exit(0)
}
