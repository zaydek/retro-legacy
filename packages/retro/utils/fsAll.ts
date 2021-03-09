import * as fs from "fs"
import * as path from "path"

export async function readdirAll(entry: string, excludes: string[] = []): Promise<string[]> {
	const ctx: string[] = []
	async function recurse(entry: string): Promise<void> {
		const ls = await fs.promises.readdir(entry)
		const items = ls.map(item => path.join(entry, item)) // Add entry
		for (const item of items) {
			if (excludes.includes(item)) continue
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

export async function copyAll(src_dir: string, dst_dir: string, excludes: string[] = []): Promise<void> {
	const dirs: string[] = []
	const srcs: string[] = []
	const ctx = await readdirAll(src_dir, excludes)
	for (const item of ctx) {
		const stats = await fs.promises.stat(item)
		if (!stats.isDirectory()) {
			srcs.push(item)
		} else {
			dirs.push(item)
		}
	}
	for (const dir of dirs) {
		const target = path.join(dst_dir, dir.slice(src_dir.length))
		await fs.promises.mkdir(target, { recursive: true })
	}
	for (const src of srcs) {
		const target = path.join(dst_dir, src.slice(src_dir.length))
		await fs.promises.copyFile(src, target)
	}
}
