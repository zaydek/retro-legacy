import * as fs from "fs"
import * as path from "path"

// readdir reads sources recursively.
export async function readdir(entry: string): Promise<string[]> {
	const ctx: string[] = []

	async function recurse(entry: string): Promise<void> {
		let list = await fs.promises.readdir(entry)
		list = list.map(item => path.join(entry, item)) // Add entry
		for (const item of list) {
			const stat = await fs.promises.stat(item)
			if (stat.isDirectory()) {
				ctx.push(item)
				await recurse(item)
				continue
			}
			ctx.push(item)
		}
	}

	await recurse(entry)
	return ctx
}
