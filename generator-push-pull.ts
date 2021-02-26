function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function* generator(): AsyncGenerator<number> {
	while (true) {
		await sleep(1e3)
		yield Math.random()
	}
}

async function run(): Promise<void> {
	const p1 = new Promise<void>(async _ => {
		const gen = generator()
		while (true) {
			console.log("a", await gen.next())
		}
		// resolve()
	})
	const p2 = new Promise<void>(async _ => {
		await sleep(500)
		const gen = generator()
		while (true) {
			console.log("b", await gen.next())
		}
		// resolve()
	})
	await Promise.all([p1, p2])
}

run()
