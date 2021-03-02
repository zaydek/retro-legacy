import * as fs from "fs"
import * as path from "path"

export async function readdirAll(entry: string, exclude: string[] = []): Promise<string[]> {
	const ctx: string[] = []

	async function recurse(entry: string): Promise<void> {
		const ls = await fs.promises.readdir(entry)
		const items = ls.map(item => path.join(entry, item)) // Add entry
		for (const item of items) {
			if (exclude.includes(item)) continue
			const stats = await fs.promises.stat(item)
			if (stats.isDirectory()) {
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

export async function copyAll(src_dir: string, dst_dir: string, exclude: string[] = []): Promise<void> {
	const dirs: string[] = []
	const srcs: string[] = []

	const ctx = await readdirAll(src_dir, exclude)
	for (const item of ctx) {
		const stats = await fs.promises.stat(item)
		if (!stats.isDirectory()) {
			dirs.push(item)
		} else {
			srcs.push(item)
		}
	}

	for (const dir of dirs) await fs.promises.mkdir(path.join(dst_dir, dir.slice(src_dir.length)), { recursive: true })
	for (const src of srcs) await fs.promises.copyFile(src, path.join(dst_dir, src.slice(src_dir.length)))
}
