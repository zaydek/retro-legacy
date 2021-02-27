// import * as esbuild from "esbuild"
// import * as fs from "fs"
// import * as log from "../lib/log"
// import * as p from "path"
// import * as resolvers from "./resolvers"
// import * as term from "../lib/term"
import * as types from "./types"
// import * as utils from "./utils"

// TODO: We need to purge the export directory before write to it.
export default async function cmd_export(runtime: types.Runtime<types.ExportCommand>): Promise<void> {
	//	let router: types.ServerRouter = {}
	//	if (!runtime.command.cached) {
	//		router = await resolvers.resolveServerRouter(runtime)
	//		// TODO: Cache router.
	//	} else {
	//		// TODO: Read route from cache.
	//	}
	//
	//	const app = await resolvers.renderServerRouterToString(runtime, router)
	//	const appPath = p.join(runtime.directories.cacheDir, "app.js")
	//	await fs.promises.writeFile(appPath, app)
	//
	//	try {
	//		const result = await esbuild.build({
	//			bundle: true,
	//			define: {
	//				__DEV__: process.env.__DEV__!,
	//				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
	//			},
	//			entryPoints: [appPath],
	//			inject: ["packages/retro/react-shim.js"],
	//			loader: { ".js": "jsx" },
	//			logLevel: "silent", // TODO
	//			minify: true,
	//			outfile: p.join(runtime.directories.exportDir, appPath.slice(runtime.directories.srcPagesDir.length)),
	//			// plugins: [...configs.retro.plugins], // TODO
	//		})
	//		// TODO: Add support for hints.
	//		if (result.warnings.length > 0) {
	//			for (const warning of result.warnings) {
	//				log.warning(utils.formatEsbuildMessage(warning, term.yellow))
	//			}
	//			process.exit(1)
	//		}
	//	} catch (err) {
	//		// TODO: How do we differentiate esbuild errors from general errors?
	//		log.error(err)
	//	}
}
