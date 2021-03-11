import fs from "fs"
import path from "path"

import { chan, Channel, go } from "./go"

function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function watcher(src: string, pollMS: number): Promise<Channel<string>> {
	const ch = chan<string>()

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
				const next = path.join(entry, nested)
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

	go(async () => {
		while (true) {
			await sleep(pollMS)
			const changed = await check(src, { deep: false })
			if (changed !== "") await ch.send(changed)
		}
	})

	return ch
}
