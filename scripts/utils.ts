import * as node_readline from "readline"

// stdout uses JSON.stringify(response) so node cannot add "\n"s
export const stdout = (response: unknown): void => console.log(JSON.stringify(response))
export const stderr = (...args: unknown[]): void => console.error(...args)

// https://stackoverflow.com/a/55161953
export const readline = ((): (() => Promise<string>) => {
	const rl = node_readline.createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const line of rl) {
			yield line
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()
