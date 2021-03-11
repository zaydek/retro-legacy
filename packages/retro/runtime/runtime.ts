import * as errors from "../errors"
import * as fs from "fs"
import * as log from "../../shared/log"
import * as pages from "../pages"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"
import * as utils from "../utils"

export async function createRuntime(cmd: T.AnyCommand): Promise<T.Runtime<typeof cmd>> {
	const runtime: T.Runtime<typeof cmd> = {
		cmd,
		dirs: {
			wwwDir: "www",
			srcPagesDir: "src/pages",
			cacheDir: "__cache__",
			exportDir: "__export__",
		},
		tmpl: "",
		pages: [],
		router: {},
	}

	if (runtime.cmd.type === "serve") return runtime

	await fs.promises.rmdir(runtime.dirs.cacheDir, { recursive: true })
	await fs.promises.rmdir(runtime.dirs.exportDir, { recursive: true })

	await fs.promises.mkdir(runtime.dirs.wwwDir, { recursive: true })
	await fs.promises.mkdir(runtime.dirs.srcPagesDir, { recursive: true })
	await fs.promises.mkdir(runtime.dirs.cacheDir, { recursive: true })
	await fs.promises.mkdir(runtime.dirs.exportDir, { recursive: true })

	const target1 = path.join(runtime.dirs.wwwDir, "index.html")

	try {
		fs.promises.stat(target1)
	} catch (error) {
		await fs.promises.writeFile(
			target1,
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

	// Read "www/index.html":
	const buffer = await fs.promises.readFile(target1)
	const contents = buffer.toString()

	if (!contents.includes("%head")) {
		log.fatal(errors.missingDocumentHeadTag(target1))
	} else if (!contents.includes("%app")) {
		log.fatal(errors.missingDocumentAppTag(target1))
	}

	runtime.tmpl = contents

	// Copy to "__export__/www":
	const target2 = path.join(runtime.dirs.exportDir, runtime.dirs.wwwDir)
	await fs.promises.mkdir(target2, { recursive: true })
	await utils.copyAll(runtime.dirs.wwwDir, target2, [path.join(runtime.dirs.wwwDir, "index.html")])

	runtime.pages = await pages.createPages(runtime.dirs)
	// const [runtime.router, error] = await on(() => router.createRouter(runtime))

	try {
		runtime.router = await router.createRouter(runtime)
	} catch {}

	// return [runtime, error]
	return runtime
}
