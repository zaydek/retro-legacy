import * as node_readline from "readline"

export const stdout = (str: string): void => console.log(JSON.stringify(str))
export const stderr = console.error

export const eof = (): void => console.log("eof")

// https://stackoverflow.com/a/55161953
export const readline = (function (): () => Promise<string> {
	const read = node_readline.createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const next of read) {
			yield next
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()
