////////////////////////////////////////////////////////////////////////////////
// Standard-input, -output, -error

const stdin = ((): (() => Promise<string>) => {
	const read = require("readline").createInterface({ input: process.stdin })
	async function* generator(): AsyncGenerator<string> {
		for await (const next of read) {
			yield next
		}
	}
	const generate = generator()
	return async () => (await generate.next()).value
})()

function stdout(...args: unknown[]): void {
	console.log(...args)
}

function stderr(...args: unknown[]): void {
	console.error(...args)
}

////////////////////////////////////////////////////////////////////////////////
// Entry point

interface Message {
	Kind: string
	Data: any
}

function run(): () => void {
	let count = 0
	console.log(`Hello, world! count=${count}`)
	count++
	return (): void => {
		console.log(`Hello, world! count=${count}`)
		count++
	}
}

async function main() {
	let rerun: () => void

	while (true) {
		const jsonMsg = await stdin()
		if (jsonMsg === undefined) {
			return
		}
		const msg: Message = JSON.parse(jsonMsg)
		switch (msg.Kind) {
			case "run":
				rerun = run()
				break
			case "rerun":
				throw new Error("Internal error")
				if (rerun! === undefined) {
					throw new Error("Internal error")
				}
				rerun()
				break
			default:
				throw new Error("Internal error")
		}
	}
}

main()
