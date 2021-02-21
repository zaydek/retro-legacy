import * as esbuild from "esbuild"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

// // convertToFilesystemPath converts a browser path to a filesystem path.
// function convertToFilesystemPath(path: string): string {
// 	// "/" -> "/index"
// 	let path2 = path
// 	if (path2.endsWith("/")) {
// 		path2 += "index"
// 	}
// 	// "/index" -> "/index.html"
// 	if (p.extname(path2) === "") {
// 		path2 += ".html"
// 	}
// 	return path2
// }

function colorStatus(statusCode: number): string {
	if (statusCode >= 200 && statusCode < 300) {
		return term.green(statusCode)
	}
	return term.red(statusCode)
}

const serve: types.serve = async runtime => {
	setTimeout(() => {
		if (utils.getWillEagerlyTerminate()) return
		utils.clearScreen()
		console.log(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}

  ${term.bold(">")} ${term.boldGreen("ok:")} ${term.bold(
			`Serving your app on port ${runtime.cmd.port}; ${term.boldUnderline(
				`http://localhost:${runtime.cmd.port}`,
			)}${term.bold(".")}`,
		)}

  ${term.bold(`When you’re ready to stop the server, press Ctrl-C.`)}
	`)
	}, 10)

	await esbuild.serve(
		{
			port: runtime.cmd.port,
			servedir: runtime.dirs.exportDir,
			onRequest: (args: esbuild.ServeOnRequestArgs) => {
				console.log(
					`  ${term.bold("→")} http://localhost:${runtime.cmd.port} - '${args.method} ${args.path}' ${colorStatus(
						args.status,
					)} (${args.timeInMS}ms${args.timeInMS === 0 ? " - cached" : ""})`,
				)
			},
		},
		{},
	)
}

export default serve
