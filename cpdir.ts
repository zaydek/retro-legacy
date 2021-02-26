import * as fs from "fs"
import * as p from "path"

async function copyAll(src: string, dst: string, exclude: string[] = []): Promise<void> {
	const directories: string[] = []
	const files: string[] = []

	// Read directories and files:
	async function recurse(entry: string): Promise<void> {
		if (exclude.includes(entry)) return

		const stat = await fs.promises.stat(entry)
		if (!stat.isDirectory()) {
			files.push(entry)
		} else {
			directories.push(entry)
			const ls = await fs.promises.readdir(entry)
			for (const each of ls) {
				await recurse(p.join(entry, each))
			}
		}
	}
	await recurse(src)

	// Copy directories recursively and then copy files:
	for (const directory of directories)
		await fs.promises.mkdir(p.join(dst, directory.slice(src.length)), { recursive: true })
	for (const file of files) await fs.promises.copyFile(file, p.join(dst, file.slice(src.length)))
}

copyAll("src", "src-copy")

// const ls = await fs.promises.readdir(entry)
// for (const each of ls) {
// 	const path = p.join(entry, each)
// 	const stat = await fs.promises.stat(path)
// 	if (!stat.isDirectory()) {
// 		// ...
// 	} else {
// 		// ...
// 	}
// }

// const arr: ParsedPath[] = []
// async function recurse(src: string): Promise<void> {
// 	const ls = await fs.promises.readdir(src)
// 	for (const each of ls) {
// 		const path = p.join(src, each)
// 		if ((await fs.promises.stat(path)).isDirectory()) {
// 			arr.push(parsePath(path))
// 			await recurse(path)
// 			continue
// 		}
// 		arr.push(parsePath(path))
// 	}
// }
// await recurse(src)
// return arr
