import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as fs from "fs"
import * as logEvents from "../logEvents"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"

// import * as log from "../../shared/log"
// import * as terminal from "../../shared/terminal"

async function exportPages(r: T.Runtime): Promise<void> {
	let once = false
	for (const meta of Object.values(r.router)) {
		const start = Date.now()
		const contents = router.routeMetaToString(r.template, meta, { devMode: false })
		await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
		await fs.promises.writeFile(meta.routeInfo.dst, contents)
		if (!once) {
			console.log()
			once = true
		}
		logEvents.export(r, meta, start)
	}
	console.log()
}

async function exportApp(r: T.Runtime): Promise<void> {
	const src = path.join(r.directories.cacheDirectory, "app.js")
	const dst = path.join(r.directories.exportDirectory, src.slice(r.directories.srcPagesDirectory.length))

	// __cache__/app.js
	const contents = router.routerToString(r.router)
	await fs.promises.writeFile(src, contents)

	// __export__/app.js
	try {
		await esbuild.build(esbuildHelpers.bundleConfiguration(src, dst))
		// if (result.warnings.length > 0) {
		// 	for (const warning of result.warnings) {
		// 		log.warning(esbuildHelpers.format(warning, terminal.yellow))
		// 	}
		// 	process.exit(1)
		// }
	} catch (error) {
		if (!("errors" in error) || !("warnings" in error)) throw error
		process.exit(1)
		// log.error(esbuildHelpers.format((error as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
	}
}

async function export_(runtime: T.Runtime<T.ExportCommand>): Promise<void> {
	await exportPages(runtime)
	await exportApp(runtime)
}

export { export_ as export }
