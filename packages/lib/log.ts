import chalk from "chalk"

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
	console.log(`${" ".repeat(2)}${chalk.bold(">")} ${chalk.bold.green("ok:")} ${chalk.bold(message)}`)
	console.log()
	once = true
}

// "> warning: ..."
export function warning(...args: unknown[]): void {
	const message = format(...args)
	if (!once) console.warn()
	console.warn(`${" ".repeat(2)}${chalk.bold(">")} ${chalk.bold.yellow("warning:")} ${chalk.bold(message)}`)
	console.warn()
	once = true
}

// "> error: ..."
export function error(...args: unknown[]): void {
	const message = format(...args)
	const traceEnabled = process.env["STACK_TRACE"] === "true"
	if (!traceEnabled) {
		if (!once) console.error()
		console.error(`${" ".repeat(2)}${chalk.bold(">")} ${chalk.bold.red("error:")} ${chalk.bold(message)}`)
		console.error()
	} else {
		if (!once) console.error()
		console.error(`${" ".repeat(2)}${chalk.bold(">")} ${chalk.bold.red("error:")} ${chalk.bold(message)}`)
		console.error()
		// console.error({ error: message }) // TODO?
	}
	process.exit(0)
}
