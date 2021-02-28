import * as fs from "fs/promises"
import * as http from "http"
import * as path from "path"

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function* watcher(root: string, { interval }: { interval: number }): AsyncGenerator<string> {
	const modTimes: { [key: string]: number } = {}

	async function read(entry: string, { deep }: { deep: boolean }): Promise<string> {
		const stat = await fs.stat(entry)
		const modTime = modTimes[entry]
		if (modTime === undefined || stat.mtimeMs !== modTime) {
			modTimes[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		if (stat.isDirectory()) {
			for (const each of await fs.readdir(entry)) {
				const src = path.join(entry, each)
				const result = await read(src, { deep })
				if (result !== "") {
					if (!deep) {
						return result
					}
				}
			}
		}
		return ""
	}

	await read(root, { deep: true })
	// return async (): Promise<string> => await read(root, { deep: false })

	// Generate source changes:
	while (true) {
		await sleep(interval)
		const src = await read(root, { deep: false })
		if (src !== "") {
			yield src
		}
	}
}

// // checker returns a generate that generates changed sources.
// async function* checker(root: string, { interval }: { interval: number }): AsyncGenerator<string> {
// 	const modTimes: { [key: string]: number } = {}
//
// 	// scan scans for a changes source.
// 	async function scan(entry: string, { deep }: { deep: boolean }): Promise<string> {
// 		const stat = await fs.stat(entry)
// 		const modTime = modTimes[entry]
// 		if (modTime === undefined || stat.mtimeMs !== modTime) {
// 			modTimes[entry] = stat.mtimeMs
// 			if (!deep) {
// 				return entry
// 			}
// 		}
// 		if (stat.isDirectory()) {
// 			for (const each of await fs.readdir(entry)) {
// 				const src = path.join(entry, each)
// 				const result = await scan(src, { deep })
// 				if (result !== "") {
// 					if (!deep) {
// 						return result
// 					}
// 				}
// 			}
// 		}
// 		return ""
// 	}
//
// 	// Scan recursively (once):
// 	await scan(root, { deep: true })
//
// 	// Generate source changes:
// 	while (true) {
// 		await sleep(interval)
// 		const src = await scan(root, { deep: false })
// 		if (src !== "") {
// 			yield src
// 		}
// 	}
// }

async function run(): Promise<void> {
	// TODO: Add parameters.
	let callback: () => void | undefined

	async function backgroundWatcher(): Promise<void> {
		const watch = watcher("watch-src", { interval: 100 })
		async function next(): Promise<string> {
			return (await watch.next()).value
		}
		while (true) {
			const src = await next()
			if (src !== "") {
				if (callback) callback()
			}
		}
	}

	// IIFE
	backgroundWatcher()

	const server = http.createServer(
		async (req: http.IncomingMessage, res: http.ServerResponse): Promise<void> => {
			console.log(req.url!)
			if (req.url! === "/~dev") {
				callback = (): void => {
					// TODO: Log event.
					res.write("event: reload\n\n")
				}
				res.writeHead(200, {
					"Content-Type": "text/event-stream",
					"Cache-Control": "no-cache",
					Connection: "keep-alive",
				})
				// Do not res.end; defer to callback.
				return
			}
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end("Hello, world!")
		},
	)
	server.listen("8000")
}

run()
