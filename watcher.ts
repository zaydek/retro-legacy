import * as http from "http"
import * as fs from "fs"
// import * as fs from "fs"

const SSE_PATH = "/__events__"

// function writeServerSentEventHeaders(res: http.ServerResponse) {
// 	res.writeHead(200, {
// 		"Content-Type": "text/event-stream",
// 		"Cache-Control": "no-cache",
// 		Connection: "keep-alive",
// 	})
// }

function sleep(forMs: number): Promise<void> {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve()
		}, forMs)
	})
}

async function* gen(): AsyncGenerator<number, void, void> {
	while (true) {
		yield 5
		await sleep(1e3)
	}
	// return "lol"
}

// watcher returns a function that checks whether sources have changed.
async function watcher(src: string): Promise<() => Generator<string>> {
	const modTimes: { [key: string]: number } = {}

	// check checks whether sources have changed.
	const check = async (entry: string, { deep }: { deep: boolean }): Promise<string> => {
		const stat = await fs.promises.stat(entry)
		// Check for changes:
		const modTime = modTimes[entry]
		if (modTime === undefined || stat.mtimeMs !== modTime) {
			modTimes[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		// Recurse on directories:
		if (stat.isDirectory()) {
			for (const nested of await fs.promises.readdir(entry)) {
				const next = p.join(entry, nested)
				const result = await check(next, { deep })
				if (result !== "") {
					if (!deep) {
						return result
					}
				}
			}
		}
		return ""
	}

	await check(src, { deep: true })
	return function* () {
		while (true) {
			yield await check(src, { deep: false })
		}
	}

	// return async (): Promise<string> => await check(src, { deep: false })
}

async function run(): Promise<void> {
	const check = watcher("src/pages")

	// function* gen() {
	//	yield
	//}

	const server = http.createServer(async (req, res) => {
		if (req.url === SSE_PATH) {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			})
			const chan = gen()
			for (const _ of chan) {
				res.write("event: reload\ndata\n\n")
			}
		}
		res.writeHead(404, { "Content-Type": "text/plain" })
		res.end("404 - Not Found")
	})
	server.listen("8000")
}

run()
