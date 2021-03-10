import * as fs from "fs"
import * as path from "path"

// readdirAll recursively reads a directory.
export async function readdirAll(entry: string, excludes: string[] = []): Promise<string[]> {
	const ctx: string[] = []
	async function recurse(current: string): Promise<void> {
		let ls = await fs.promises.readdir(current)
		ls = ls.map(item => path.join(current, item)) // Add entry
		for (const li of ls) {
			if (excludes.includes(li)) continue
			const stats = await fs.promises.stat(li)
			if (stats.isDirectory()) {
				ctx.unshift(li)
				await recurse(li)
				continue
			}
			ctx.unshift(li)
		}
	}
	await recurse(entry)
	return ctx
}

// copyAll recursively copies files and directories.
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
