type Resolve<T> = (value: T | PromiseLike<T>) => void

// sleep returns a promise that resolves after ms milliseconds.
function sleep(ms: number): Promise<void> {
	return new Promise((resolve: Resolve<void>): void => void setTimeout(resolve, ms))
}

interface Channel<T> {
	send(data: T): Promise<void>
	recv(): Promise<T>
}

// chan creates a channel. A channel describes a two-queue system. One queue
// resolves send promises and one queue resolves recv promises.
//
// This implementation is inspired by:
//
// - https://krasimirtsonev.com/blog/article/we-need-channels-intro-to-csp
//
function chan<T>(): Channel<T> {
	const send_queue: (() => T)[] = []
	const recv_queue: ((value: T) => void)[] = []

	return {
		send(data: T): Promise<void> {
			return new Promise((resolve: Resolve<void>): void => {
				if (recv_queue.length > 0) {
					recv_queue.shift()?.(data)
					resolve()
				} else {
					send_queue.push(
						(): T => {
							resolve()
							return data
						},
					)
				}
			})
		},
		recv(): Promise<T> {
			return new Promise((resolve: Resolve<T>): void => {
				if (send_queue.length > 0) {
					resolve(send_queue.shift()?.())
				} else {
					recv_queue.push(resolve)
				}
			})
		},
	}
}

// go starts a promise in the background (does not block).
function go(promise: () => Promise<void>): void {
	promise()
}

async function run(): Promise<void> {
	const kill = chan<undefined>()

	go(
		async (): Promise<void> => {
			while (true) {
				if (Math.random() * 10 > 9) {
					await kill.send(undefined)
				}
				console.log("Hello")
				await sleep(1)
			}
		},
	)

	go(
		async (): Promise<void> => {
			// await sleep(50) // Offset by 50ms
			while (true) {
				if (Math.random() * 10 > 9) {
					await kill.send(undefined)
				}
				console.log("Goodbye")
				await sleep(1)
			}
		},
	)

	await kill.recv()
	process.exit(1)
}

run()

var t = "hello"
if (t) {
	console.log("hello")
}

var a = [1, 2, 3]
var b = a.reduce((acc, each): Object => {
	return acc
}, {})

if ("hello") {
	console.log("hello")
}
