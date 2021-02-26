import * as fs from "fs"
import * as p from "path"

export function sleep(ms: number): Promise<void> {
	return new Promise(resolve => setTimeout(resolve, ms))
}

export async function* watcher(root: string, { interval }: { interval: number }): AsyncGenerator<string> {
	const modTimes: { [key: string]: number } = {}

	async function read(entry: string, { deep }: { deep: boolean }): Promise<string> {
		const stat = await fs.promises.stat(entry)
		const modTime = modTimes[entry]
		if (modTime === undefined || stat.mtimeMs !== modTime) {
			modTimes[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		if (stat.isDirectory()) {
			for (const each of await fs.promises.readdir(entry)) {
				const src = p.join(entry, each)
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

	// Generate source changes:
	while (true) {
		await sleep(interval)
		const src = await read(root, { deep: false })
		if (src !== "") {
			yield src
		}
	}
}
