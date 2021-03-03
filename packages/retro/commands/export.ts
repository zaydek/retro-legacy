import * as esbuild from "esbuild"
import * as events from "../events"
import * as fs from "fs"
import * as helpers from "../esbuild-helpers"
import * as log from "../../lib/log"
import * as path from "path"
import * as router from "../router"
import * as terminal from "../../lib/terminal"
import * as types from "../types"

async function exportHTML(runtime: types.Runtime): Promise<void> {
	let once = false
	for (const meta of Object.values(runtime.router)) {
		const start = Date.now()
		const str = await router.renderRouteMetaToString(runtime.document, meta)
		await fs.promises.mkdir(path.dirname(meta.routeInfo.dst), { recursive: true })
		await fs.promises.writeFile(meta.routeInfo.dst, str)
		if (!once) {
			console.log()
			once = true
		}
		events.export_(runtime, meta, start)
	}
	console.log()
}

async function exportJS(runtime: types.Runtime): Promise<void> {
	const src = path.join(runtime.directories.cacheDirectory, "app.js")
	const dst = path.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length))

	// __cache__/app.js
	const contents = await router.renderRouterToString(runtime.router)
	await fs.promises.writeFile(src, contents)

	// __export__/app.js
	try {
		const result = await esbuild.build(helpers.bundleAppConfiguration(src, dst))
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(helpers.format(warning, terminal.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		if (!("errors" in err) || !("warnings" in err)) throw err
		log.error(helpers.format((err as esbuild.BuildFailure).errors[0]!, terminal.bold.red))
	}
}

export async function export_(runtime: types.Runtime<types.ExportCommand>): Promise<void> {
	await exportHTML(runtime)
	await exportJS(runtime)
}
