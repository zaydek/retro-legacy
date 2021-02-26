import * as fs from "fs"
import * as log from "../../lib/log"
import * as p from "path"
import * as types from "../types"

import { parsePages } from "./parsePages"

// runServerGuards tests for the presence of runtime directories and
// public/index.html.
async function runServerGuards(directories: types.DirConfiguration): Promise<void> {
	// prettier-ignore
	const dirs = [
		directories.publicDir,
		directories.srcPagesDir,
		directories.cacheDir,
		directories.exportDir,
	]

	for (const dir of dirs) {
		try {
			await fs.promises.stat(dir)
		} catch (_) {
			fs.promises.mkdir(dir, { recursive: true })
		}
	}

	// Guards public/index.html:
	const path = p.join(directories.publicDir, "index.html")
	try {
		const data = await fs.promises.readFile(path)
		const text = data.toString()
		if (!text.includes("%head")) {
			// TODO: Extract to errs?
			log.error(`${path}: Add '%head%' somewhere to '<head>'.

For example:

...
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	%head%
</head>
...`)
		} else if (!text.includes("%page")) {
			// TODO: Extract to errs?
			log.error(`${path}: Add '%page%' somewhere to '<body>'.

For example:

...
<body>
	%page%
</body>
...`)
		}
	} catch (_) {
		await fs.promises.writeFile(
			path,
			`<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%head%
	</head>
	<body>
		%page%
	</body>
</html>
`,
		)
	}
}

export async function copyAll(src: string, dst: string, exclude: string[] = []): Promise<void> {
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

export async function preflight(runtime: types.Runtime): Promise<void> {
	// Run server guards:
	await runServerGuards(runtime.directories)

	// Purge __export__:
	await fs.promises.rmdir(runtime.directories.exportDir, { recursive: true })
	await copyAll(runtime.directories.publicDir, p.join(runtime.directories.exportDir, runtime.directories.publicDir), [
		p.join(runtime.directories.publicDir, "index.html"),
	])

	// Read runtime.document and runtime.pages:
	const data = await fs.promises.readFile(p.join(runtime.directories.publicDir, "index.html"))
	runtime.document = data.toString()
	runtime.pages = await parsePages(runtime.directories)
}
