import * as errors from "./errors"
import * as fs from "fs"
import * as log from "../lib/log"
import * as path from "path"
import * as types from "./types"
import * as utils from "./utils"

import parsePageInfosFromDirectories from "./pages"

export default async function newRuntimeFromCommand(command: types.Command): Promise<types.Runtime<typeof command>> {
	const runtime: types.Runtime = {
		command,
		directories: {
			publicDirectory: "public",
			srcPagesDirectory: "src/pages",
			cacheDirectory: "__cache__",
			exportDirectory: "__export__",
		},
		document: "",
		pages: [],
		router: {},

		// runServerGuards runs server guards that ensure safe development.
		async runServerGuards(): Promise<void> {
			const dirs = [
				runtime.directories.publicDirectory,
				runtime.directories.srcPagesDirectory,
				runtime.directories.cacheDirectory,
				runtime.directories.exportDirectory,
			]

			for (const dir of dirs) {
				try {
					await fs.promises.stat(dir)
				} catch (err) {
					fs.promises.mkdir(dir, { recursive: true })
				}
			}

			const src = path.join(runtime.directories.publicDirectory, "index.html")

			try {
				fs.promises.stat(src)
			} catch (err) {
				await fs.promises.writeFile(
					src,
					utils.detab(`
						<!DOCTYPE html>
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
					`),
				)
			}

			const buf = await fs.promises.readFile(src)
			const str = buf.toString()

			if (str.includes("%head")) {
				log.error(errors.missingDocumentHeadTag(src))
			} else if (str.includes("%page")) {
				log.error(errors.missingDocumentPageTag(src))
			}
		},

		// resolveDocument resolves and or refreshes this.document.
		async resolveDocument(): Promise<void> {
			const src = path.join(this.directories.publicDirectory, "index.html")
			const buf = await fs.promises.readFile(src)
			const str = buf.toString()
			this.document = str
		},

		// resolvePages resolves and or refreshes this.pages.
		async resolvePages(): Promise<void> {
			this.pages = await parsePageInfosFromDirectories(this.directories)
		},

		// resolveRouter resolves and or refreshes this.router.
		async resolveRouter(): Promise<void> {
			// ...
		},

		// purgeCacheDirectory purges __cache__.
		async purgeCacheDirectory(): Promise<void> {
			await fs.promises.rmdir(runtime.directories.cacheDirectory, { recursive: true })
		},

		// purgeExportDirectory purges __export__.
		async purgeExportDirectory(): Promise<void> {
			const excludes = [path.join(runtime.directories.srcPagesDirectory, "index.html")]
			await fs.promises.rmdir(runtime.directories.exportDirectory, { recursive: true })
			await utils.copyAll(
				runtime.directories.publicDirectory,
				path.join(runtime.directories.exportDirectory, runtime.directories.publicDirectory),
				excludes,
			)
		},
	}

	const once = async (): Promise<void> => {
		await runtime.runServerGuards()
		await runtime.resolveDocument()
		await runtime.resolvePages()
		await runtime.resolveRouter()
	}

	await once()
	return runtime
}
