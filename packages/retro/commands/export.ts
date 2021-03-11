import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as fs from "fs"
import * as events from "../events"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"

// TODO: Add support for an event hook?
async function export_(runtime: T.Runtime<T.ExportCommand>): Promise<void> {
	// Log and export routes:
	for (const meta of Object.values(runtime.router)) {
		const start = Date.now()
		const contents = router.routeMetaToString(runtime.tmpl, meta, { dev: false })
		await fs.promises.mkdir(path.dirname(meta.route.dst), { recursive: true })
		await fs.promises.writeFile(meta.route.dst, contents)
		events.export(runtime, meta, start)
	}
	console.log()

	// __cache__/app.js
	const src = path.join(runtime.dirs.cacheDir, "app.js")
	const contents = router.routerToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	// __export__/app.js
	try {
		const dst = path.join(runtime.dirs.exportDir, src.slice(runtime.dirs.srcPagesDir.length))
		await esbuild.build(esbuildHelpers.bundleConfiguration(src, dst))
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
	}
}

export { export_ as export }
