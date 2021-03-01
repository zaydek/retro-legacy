function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

interface Channel {
	send(data: unknown): Promise<void>
	recv(): Promise<unknown>
}

// https://krasimirtsonev.com/blog/article/we-need-channels-intro-to-csp
function chan(): Channel {
	const puts: (() => unknown)[] = []
	const takes: ((value?: unknown) => void)[] = []

	return {
		send(data: unknown): Promise<void> {
			return new Promise(resolve => {
				if (takes.length > 0) {
					takes.shift()!(data)
					resolve()
				} else {
					puts.push(() => {
						resolve()
						return data
					})
				}
			})
		},
		recv(): Promise<unknown> {
			return new Promise(resolve => {
				if (puts.length > 0) {
					resolve(puts.shift()!())
				} else {
					takes.push(resolve)
				}
			})
		},
	}
}

function go(fn: () => Promise<void>): void {
	async function run() {
		await fn()
	}
	run()
}

async function run() {
	const ch = chan()

	go(async () => {
		await ch.send("hello, world!")
		await ch.send("hello, world!")
		await ch.send("hello, world!")
		await sleep(1_000)
		await ch.send("hello, world!")
	})

	for (;;) {
		const msg = await ch.recv()
		if (msg === undefined) {
			// No-op
			return
		}
		console.log(msg)
	}
}

run()
