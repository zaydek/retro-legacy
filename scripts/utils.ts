import * as node_readline from "readline"
import * as T from "./types"

export const stdout = (msg: T.Message): void => console.log(JSON.stringify(msg))
export const stderr = console.error

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
