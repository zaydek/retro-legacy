import * as node_readline from "readline"

// export const stdout = (data: unknown): void => console.log(JSON.stringify(data))

export const stdout = (...args: unknown[]): void => console.log(...args)
export const stderr = (...args: unknown[]): void => console.error(...args)

// export function sleep(ms: number): Promise<void> {
// 	return new Promise(resolve => setTimeout(resolve, ms))
// }

// https://stackoverflow.com/a/55161953
export const readline = ((): (() => Promise<string>) => {
	const rl = node_readline.createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const line of rl) {
			yield line
		}
		throw new Error("Internal error")
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()
