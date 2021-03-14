import * as node_readline from "readline"

export const stdout = data => console.log(JSON.stringify(data))
export const stderr = console.error

export function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// https://stackoverflow.com/a/55161953
export const readline = (() => {
	const rl = node_readline.createInterface({ input: process.stdin })
	async function* generator() {
		for await (const line of rl) {
			yield line
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()
