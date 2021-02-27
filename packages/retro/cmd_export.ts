import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as resolvers from "./resolvers"
import * as resolversText from "./resolversText"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

export default async function cmd_export(runtime: types.Runtime<types.ExportCommand>): Promise<void> {
	const router = await resolvers.resolveServerRouter(runtime)

	const appContents = await resolversText.renderServerRouterToString(runtime, router)
	const appContentsPath = p.join(runtime.directories.cacheDir, "app.js")
	await fs.promises.writeFile(appContentsPath, appContents)

	try {
		const result = await esbuild.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			},
			entryPoints: [appContentsPath],
			inject: ["packages/retro/react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			minify: true,
			outfile: p.join(runtime.directories.exportDir, appContentsPath.slice(runtime.directories.srcPagesDir.length)),
			// plugins: [...configs.retro.plugins], // TODO
		})
		// TODO: Add support for hints.
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(utils.formatEsbuildMessage(warning, term.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		// TODO: Differentiate esbuild errors.
		log.error(err)
	}
}
