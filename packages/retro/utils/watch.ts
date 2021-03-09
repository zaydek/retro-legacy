import * as fs from "fs"
import * as p from "path"

// watcher implements a simple filesystem watcher. The first run builds a cache
// that maps paths to mtimeMs. Consecutive runs returns on filesystem events.
export async function watcher(root: string): Promise<() => Promise<string>> {
	const mtimeMsMap: { [key: string]: number } = {}

	// recurse recurses on an entry path. Parameter deep describes whether to
	// eagerly return on mtimeMs mismatches.
	async function recurse(entry: string, { deep }: { deep: boolean }): Promise<string> {
		const stat = await fs.promises.stat(entry)
		const mtimeMs = mtimeMsMap[entry]
		if (mtimeMs === undefined || stat.mtimeMs !== mtimeMs) {
			mtimeMsMap[entry] = stat.mtimeMs
			if (!deep) {
				return entry
			}
		}
		if (stat.isDirectory()) {
			for (const each of await fs.promises.readdir(entry)) {
				const src = p.join(entry, each)
				const result = await recurse(src, { deep })
				if (result !== "") {
					if (!deep) {
						return result
					}
				}
			}
		}
		return ""
	}

	await recurse(root, { deep: true })
	return async () => await recurse(root, { deep: false })
}
