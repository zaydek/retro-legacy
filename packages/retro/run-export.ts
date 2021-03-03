import * as esbuild from "esbuild"
import * as fs from "fs"
import * as log from "../lib/log"
import * as path from "path"
import * as term from "../lib/term"
import * as textResolvers from "./router-text"
import * as types from "./types"
import * as utils from "./utils"

export default async function runExport(runtime: types.Runtime<types.ExportCommand>): Promise<void> {
	const contents = await textResolvers.renderRouterToString(runtime.router)

	const src = path.join(runtime.directories.cacheDirectory, "app.js")
	const dst = path.join(runtime.directories.exportDirectory, src.slice(runtime.directories.srcPagesDirectory.length))

	await fs.promises.writeFile(src, contents)

	try {
		const result = await esbuild.build({
			bundle: true,
			define: {
				__DEV__: process.env.__DEV__!,
				"process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV),
			},
			entryPoints: [src],
			inject: ["packages/retro/react-shim.js"],
			loader: { ".js": "jsx" },
			logLevel: "silent", // TODO
			minify: true,
			outfile: dst,
			// plugins: [...configs.retro.plugins], // TODO
		})
		if (result.warnings.length > 0) {
			for (const warning of result.warnings) {
				log.warning(utils.format_esbuild(warning, term.yellow))
			}
			process.exit(1)
		}
	} catch (err) {
		if (!("errors" in err) || !("warnings" in err)) throw err
		log.error(utils.format_esbuild((err as esbuild.BuildFailure).errors[0]!, term.bold.red))
	}
}
