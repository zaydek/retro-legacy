const node_readline = require("readline")

const stdout = data => console.log(JSON.stringify(data))
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
		const bstr = await readline()
		if (bstr === undefined) {
			break
		}
		const msg = JSON.parse(bstr)
		switch (msg.Kind) {
			case "foo":
				stdout(msg)
				break
			case "bar":
				stderr("oops\noops")
				// stdout(msg)
				break
			case "baz":
				stdout(msg)
				break
			case "done":
				return
		}
	}
}

main()
