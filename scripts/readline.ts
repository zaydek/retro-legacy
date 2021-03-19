import * as T from "./types"

export const stdout = (msg: T.Message): void => console.log(JSON.stringify(msg))
export const stderr = (...args: unknown[]): void => console.error(...args)

export const readline = ((): (() => Promise<string>) => {
	const read = require("readline").createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const next of read) {
			yield next
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()
