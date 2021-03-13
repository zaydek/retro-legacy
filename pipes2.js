// const fs = require("fs")

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// function main() {
// 	console.log("b")
//
// 	const stdinBuffer = fs.readFileSync(0)
// 	console.log(stdinBuffer.toString())
//
// 	console.log("c")
//
// 	// for (let x = 0; x < 100; x++) {
// 	// 	if (Math.random() < 0.5) {
// 	// 		console.log("Hello, world!")
// 	// 	} else {
// 	// 		console.error("Hello, world!")
// 	// 	}
// 	// 	// await sleep(25)
// 	// }
// 	// const stdin = fs.readFileSync(0)
// 	// const msg = stdin.toString()
// 	// console.log(msg)
// 	// console.error("end")
// 	// while (true) {
// 	// }
// 	// for (let x = 0; x < 10; x++) {
// 	// 	await sleep(100)
// 	// 	console.log("Hello, world!")
// 	// }
// 	// console.log("program ended")
// }

// main()

// console.log(process.stdin.fd === 0)

// const buf = fs.readFileSync(process.stdin.fd)

const node_readline = require("readline")

// https://stackoverflow.com/a/55161953
const readline = (() => {
	const rl = node_readline.createInterface({ input: process.stdin })
	async function* generator() {
		for await (const line of rl) {
			yield line
		}
	}
	const gen = generator()
	return async () => (await gen.next()).value
})()

async function main() {
	console.log(await readline())
	console.log(await readline())

	// let x = 0
	// for await (const input of rl) {
	// 	if (x >= 10) {
	// 		break
	// 	}
	// 	console.log(input)
	// 	await sleep(1_000)
	// }
	// console.error("done")
}

main()

// const stdinBuf = fs.readFileSync(0)
// console.log(stdinBuf.toString())
