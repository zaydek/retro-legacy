async function on<T>(fn: () => T | Promise<T>): Promise<[T | null, Error | null]> {
	try {
		const res = await fn()
		return [res, null]
	} catch (error) {
		return [null, error]
	}
}

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, ms)
	})
}

async function fn(): Promise<string> {
	await sleep(1_000)
	return "Hello, world!"
}

async function main(): Promise<void> {
	const [res, err] = await on(() => fn())
	if (err !== null) {
		console.log("here", err)
		return
	}
	console.log(res)
}

main()
