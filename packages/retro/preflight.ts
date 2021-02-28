import * as errs from "./errs"
import * as fs from "fs/promises"
import * as log from "../lib/log"
import * as p from "path"
import * as resolvers from "./resolvers"
import * as types from "./types"

import parsePages from "./pages"

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

	// Guard directories:
	for (const dir of dirs) {
		try {
			await fs.stat(dir)
		} catch (_) {
			fs.mkdir(dir, { recursive: true })
		}
	}

	// Guard public/index.html:
	const path = p.join(directories.publicDir, "index.html")
	try {
		const data = await fs.readFile(path)
		const text = data.toString()
		if (!text.includes("%head")) {
			log.error(errs.missingHeadTemplateTag(path))
		} else if (!text.includes("%page")) {
			log.error(errs.missingPageTemplateTag(path))
		}
	} catch (_) {
		await fs.writeFile(
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
`, // EOF
		)
	}
}

export async function copyAll(src: string, dst: string, exclude: string[] = []): Promise<void> {
	const directories: string[] = []
	const files: string[] = []

	// Read directories and files:
	async function recurse(entry: string): Promise<void> {
		if (exclude.includes(entry)) return

		const stat = await fs.stat(entry)
		if (!stat.isDirectory()) {
			files.push(entry)
		} else {
			directories.push(entry)
			const ls = await fs.readdir(entry)
			for (const each of ls) {
				await recurse(p.join(entry, each))
			}
		}
	}
	await recurse(src)

	// Copy directories recursively and then copy files:
	for (const directory of directories) await fs.mkdir(p.join(dst, directory.slice(src.length)), { recursive: true })
	for (const file of files) await fs.copyFile(file, p.join(dst, file.slice(src.length)))
}

export default async function preflight(runtime: types.Runtime<types.DevCommand | types.ExportCommand>): Promise<void> {
	// Run server guards:
	await runServerGuards(runtime.directories)

	// Purge __export__:
	await fs.rmdir(runtime.directories.exportDir, { recursive: true })
	await copyAll(runtime.directories.publicDir, p.join(runtime.directories.exportDir, runtime.directories.publicDir), [
		p.join(runtime.directories.publicDir, "index.html"),
	])

	// Resolve runtime.document and runtime.pages:
	const data = await fs.readFile(p.join(runtime.directories.publicDir, "index.html"))
	runtime.document = data.toString()
	runtime.pages = await parsePages(runtime.directories)

	// Resolve runtime.router from runtime.pages:
	//
	// TODO: Implement '---cache' here.
	runtime.router = await resolvers.resolveRouter(runtime)
}
