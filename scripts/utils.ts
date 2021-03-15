import * as node_readline from "readline"
import * as T from "./types"

export function stdout(msg: T.Message): void {
	console.log(JSON.stringify(msg))
}

export function stderr(...args: unknown[]): void {
	console.error(...args)
}

export let readline: () => Promise<string>

// https://stackoverflow.com/a/55161953
async function init(): Promise<void> {
	const read = node_readline.createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const next of read) {
			yield next
		}
	}
	const generate = generator()
	readline = async () => (await generate.next()).value
}

init()
