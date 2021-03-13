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

	// await sleep(1_000)
	for (let x = 0; x < 10; x++) {
		// await sleep(1_000)
		message({ foo: "bar" })
	}

	// await sleep(1_000)
	end()
}

main()

process.on("uncaughtException", err => {
	error(err)
})
