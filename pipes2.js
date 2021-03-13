const node_readline = require("readline")

const stdout = console.log
const stderr = console.error

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// https://stackoverflow.com/a/55161953
const readline = (() => {
	const interface = node_readline.createInterface({ input: process.stdin })
	async function* generator() {
		for await (const line of interface) {
			yield line
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()

async function main() {
	while (true) {
		const encoded = await readline()
		if (encoded === undefined) {
			break
		}
		const data = JSON.parse(encoded)

		stdout(JSON.stringify(data))
		await sleep(100)

		stdout(JSON.stringify(data))
		await sleep(100)

		stderr(JSON.stringify(data))
		await sleep(100)

		stdout(JSON.stringify(data))
		await sleep(100)

		stdout(JSON.stringify(data))
		await sleep(1_000)
	}
}

main()
