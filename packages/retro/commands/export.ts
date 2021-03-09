import * as esbuild from "esbuild"
import * as esbuildHelpers from "../esbuild-helpers"
import * as fs from "fs"
import * as logEvents from "../logEvents"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"

// import * as log from "../../shared/log"
// import * as terminal from "../../shared/terminal"

async function exportPages(runtime: T.Runtime): Promise<void> {
	let once = false
	for (const meta of Object.values(runtime.router)) {
		const start = Date.now()
		const contents = router.renderRouteMetaToString(runtime.template, meta, { dev: false })
		await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
		await fs.promises.writeFile(meta.routeInfo.dst, contents)
		if (!once) {
			console.log()
			once = true
		}
		logEvents.export_(runtime, meta, start)
	}
	console.log()
}

async function exportApp(runtime: T.Runtime): Promise<void> {
	const src = path.join(runtime.directories.cacheDirectory, "app.js")
	const dst = path.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length))

	// __cache__/app.js
	const contents = router.renderRouterToString(runtime.router)
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

export async function export_(runtime: T.Runtime<T.ExportCommand>): Promise<void> {
	await exportPages(runtime)
	await exportApp(runtime)
}
