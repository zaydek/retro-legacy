function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function main() {
	for (let x = 0; x < 100; x++) {
		if (Math.random() < 0.5) {
			console.log("Hello, world!")
		} else {
			console.error("Hello, world!")
		}
		await sleep(25)
	}

	// const stdin = fs.readFileSync(0)
	// const msg = stdin.toString()
	// console.log(msg)
	// console.error("end")
	// while (true) {
	// }
	// for (let x = 0; x < 10; x++) {
	// 	await sleep(100)
	// 	console.log("Hello, world!")
	// }
	// console.log("program ended")
}

main()
