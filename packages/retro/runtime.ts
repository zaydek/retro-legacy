import * as errors from "./errors"
import * as fs from "fs"
import * as log from "../shared/log"
import * as pages from "./pages"
import * as path from "path"
import * as router from "./router"
import * as T from "./types"
import * as utils from "./utils"

export default async function newRuntimeFromCommand(command: T.AnyCommand): Promise<T.Runtime<typeof command>> {
	const runtime: T.Runtime<typeof command> = {
		cmd: command,
		dirs: {
			wwwDir: "www",
			srcPagesDir: "src/pages",
			cacheDir: "__cache__",
			exportDir: "__export__",
		},
		tmpl: "",
		pages: [],
		router: {},

		// runServerGuards runs server guards.
		async serverGuards(): Promise<void> {
			const dirs = [runtime.dirs.wwwDir, runtime.dirs.srcPagesDir, runtime.dirs.cacheDir, runtime.dirs.exportDir]
			for (const dir of dirs) {
				try {
					await fs.promises.stat(dir)
				} catch (error) {
					fs.promises.mkdir(dir, { recursive: true })
				}
			}

			const src = path.join(runtime.dirs.wwwDir, "index.html")

			try {
				fs.promises.stat(src)
			} catch (error) {
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
								%app%
							</body>
						</html>
					`),
				)
			}

			const buffer = await fs.promises.readFile(src)
			const str = buffer.toString()

			if (!str.includes("%head")) {
				log.error(errors.missingDocumentHeadTag(src))
			} else if (!str.includes("%app")) {
				log.error(errors.missingDocumentAppTag(src))
			}
		},

		// purge purges __cache__ and __export__.
		async purge(): Promise<void> {
			const dirs = runtime.dirs
			await fs.promises.rmdir(dirs.cacheDir, { recursive: true })
			await fs.promises.rmdir(dirs.exportDir, { recursive: true })

			// await this.runServerGuards()
			const excludes = [path.join(dirs.wwwDir, "index.html")]

			// TODO: Do we need this?
			await fs.promises.mkdir(path.join(dirs.exportDir, dirs.wwwDir), { recursive: true })
			await utils.copyAll(dirs.wwwDir, path.join(dirs.exportDir, dirs.wwwDir), excludes)
		},

		// resolveDocument resolves and or refreshes this.document.
		async resolveDocument(): Promise<void> {
			const src = path.join(this.dirs.wwwDir, "index.html")
			const buffer = await fs.promises.readFile(src)
			const str = buffer.toString()
			this.tmpl = str
		},

		// resolvePages resolves and or refreshes this.pages.
		async resolvePages(): Promise<void> {
			this.pages = await pages.newPagesFromDirectories(this.dirs)
		},

		// resolveRouter resolves and or refreshes this.router.
		async resolveRouter(): Promise<void> {
			this.router = await router.newFromRuntime(this)
		},
	}

	async function start(): Promise<void> {
		if (runtime.cmd.type === "serve") {
			// No-op
			return
		}
		await runtime.serverGuards()
		await runtime.purge() // TODO
		await runtime.resolveDocument()
		await runtime.resolvePages()
		await runtime.resolveRouter()
	}

	await start()
	return runtime
}
