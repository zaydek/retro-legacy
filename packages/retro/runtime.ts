import * as errors from "./errors"
import * as fs from "fs"
import * as log from "../lib/log"
import * as path from "path"
import * as types from "./types"

const assertDirectories = (runtime: types.Runtime) => async (): Promise<void> => {
	const d = runtime.directories
	const dirs = [d.publicDirectory, d.srcPagesDirectory, d.cacheDirectory, d.exportDirectory]

	for (const dir of dirs) {
		try {
			await fs.promises.stat(dir)
		} catch (err) {
			fs.promises.mkdir(dir, { recursive: true })
		}
	}
}

const assertPublicIndexHTML = (runtime: types.Runtime) => async (): Promise<void> => {
	const src = path.join(runtime.directories.publicDirectory, "index.html")

	try {
		fs.promises.stat(src)
	} catch (err) {
		await fs.promises.writeFile(
			src,
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

	const buf = await fs.promises.readFile(src)
	const str = buf.toString()

	if (str.includes("%head")) {
		log.error(errors.missingDocumentHeadTag(src))
	} else if (str.includes("%page")) {
		log.error(errors.missingDocumentPageTag(src))
	}
}

export default function newRuntimeFromCommand(command: types.Command): types.Runtime<typeof command> {
	const runtime: types.Runtime = {
		command,

		// NOTE: Directories can be overridden as environmental variables. Retro
		// does not (yet?) support a configuration file.
		// prettier-ignore
		directories: {
			publicDirectory:   process.env.PUBLIC_DIR ?? "public",
			srcPagesDirectory: process.env.PAGES_DIR  ?? "src/pages",
			cacheDirectory:    process.env.CACHE_DIR  ?? "__cache__",
			exportDirectory:   process.env.EXPORT_DIR ?? "__export__",
		},
		document: "",
		pages: [],
		router: {},

		// runServerGuards runs server guards that ensure safe development.
		async runServerGuards(): Promise<void> {
			await assertDirectories(this)()
			await assertPublicIndexHTML(this)()
		},
		// resolveDocument resolves and or refreshes this.document.
		async resolveDocument(): Promise<void> {
			const buf = await fs.promises.readFile(path.join(this.directories.publicDirectory, "index.html"))
			const str = buf.toString()
			this.document = str
		},
		// resolvePages resolves and or refreshes this.pages.
		async resolvePages(): Promise<void> {
			// this.pages = await parsePages(this.directories)
		},
		// resolveRouter resolves and or refreshes this.router.
		async resolveRouter(): Promise<void> {
			// ...
		},
		// purgeCacheDirectory purges __cache__.
		async purgeCacheDirectory(): Promise<void> {
			// ...
		},
		// purgeExportDirectory purges __export__.
		async purgeExportDirectory(): Promise<void> {
			// ...
		},
	}

	runtime.runServerGuards()
	runtime.resolveDocument()
	runtime.resolvePages()
	runtime.resolveRouter()
	return runtime
}
