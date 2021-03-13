const START = "start"
const MESSAGE = "message"
const END = "end"
const ERROR = "error"

const start = () => console.log(JSON.stringify({ kind: START }))
const message = data => console.log(JSON.stringify({ kind: MESSAGE, data }))
const error = error => console.error(JSON.stringify({ kind: ERROR, error }))
const end = () => console.log(JSON.stringify({ kind: END }))

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
	start()

	console.error("\x1b[1moops\x1b[0m")

	await sleep(10)
	for (let x = 0; x < 10; x++) {
		await sleep(10)
		message({ foo: "bar" })
	}

	await sleep(10)
	end()
}

main()

process.on("uncaughtException", err => {
	error(err)
})
