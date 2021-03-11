// https://krasimirtsonev.com/blog/article/we-need-channels-intro-to-csp

export interface Channel<T> {
	send(data: T): Promise<void>
	recv(): Promise<T>
}

export type Process = () => Promise<void>

export function chan<T>(): Channel<T> {
	const send_queue: (() => T)[] = []
	const recv_queue: ((value: T) => void)[] = []

	return {
		send(data) {
			return new Promise(resolve => {
				if (recv_queue.length > 0) {
					recv_queue.shift()!(data)
					resolve()
				} else {
					send_queue.push(() => {
						resolve()
						return data
					})
				}
			})
		},
		recv() {
			return new Promise(resolve => {
				if (send_queue.length > 0) {
					resolve(send_queue.shift()!())
				} else {
					recv_queue.push(resolve)
				}
			})
		},
	}
}

export function go(process: Process): void {
	process()
}
