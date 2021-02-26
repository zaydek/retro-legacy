import * as fs from "fs"
import * as path from "path"

// First, we want to a generator for filesystem events
// Then we want to create a generator based on filesystem events for rebuilds (when done)
// Then we can call the second generator in the scope of a HTTP handler to push server-sent events

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

// watcher returns a generate that generates changed sources.
async function* watcher(root: string, { interval }: { interval: number }): AsyncGenerator<string> {
	const modTimes: { [key: string]: number } = {}

	// scan scans for a changes source.
	async function scan(entry: string, { deep }: { deep: boolean }): Promise<string> {
		const stat = await fs.promises.stat(entry)
		const modTime = modTimes[entry]
		if (modTime === undefined || stat.mtimeMs !== modTime) {
			modTimes[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		if (stat.isDirectory()) {
			for (const nested of await fs.promises.readdir(entry)) {
				const next = path.join(entry, nested)
				const result = await scan(next, { deep })
				if (result !== "") {
					if (!deep) {
						return result
					}
				}
			}
		}
		return ""
	}

	// Scan recursively (once):
	await scan(root, { deep: true })

	// Generate source changes:
	while (true) {
		await sleep(interval)
		const src = await scan(root, { deep: false })
		if (src !== "") {
			yield src
		}
	}
}

async function run(): Promise<void> {
	const watch = watcher("watch-src", { interval: 100 })

	async function* layered(): AsyncGenerator<string> {
		while (true) {
			await sleep(1e3)
			yield (await watch.next()).value
		}
	}

	const layeredWatch = layered()

	while (true) {
		console.log((await layeredWatch.next()).value)
	}
}

run()
