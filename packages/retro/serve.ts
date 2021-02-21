import * as esbuild from "esbuild"
import * as term from "../lib/term"
import * as types from "./types"
import * as utils from "./utils"

// This implementation is loosely based on https://stackoverflow.com/a/44188852.
// TODO: Use the esbuild serve command?
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
			// onRequest: (_: esbuild.ServeOnRequestArgs) => {},
		},
		{},
	)

	// const server = http.createServer(
	// 	async (req, res): Promise<void> => {
	// 		if (req.url === "/favicon.ico") {
	// 			res.writeHead(204)
	// 			return
	// 		}
	//
	// 		// Convert the browser path to a filesystem path:
	// 		req.url = convertToFilesystemPath(req.url!)
	//
	// 		let bytes: Buffer
	// 		try {
	// 			const path = p.join(process.cwd(), req.url)
	// 			bytes = await fs.promises.readFile(path)
	// 		} catch (err) {
	// 			if (err.code === constants.ENOENT) {
	// 				res.writeHead(404)
	// 				res.end(http.STATUS_CODES[404])
	// 				// ...
	// 				return
	// 			} else {
	// 				res.writeHead(500)
	// 				res.end(http.STATUS_CODES[500])
	// 				// ...
	// 				return
	// 			}
	// 		}
	// 		// Done:
	// 		res.writeHead(200)
	// 		// ...
	// 		res.end(bytes)
	// 	},
	// )
	//
	// setTimeout(() => {
	// 	// if (didError()) return
	// 	utils.clearScreen()
	// 	console.log(`${term.gray([process.argv0, ...process.argv.slice(1)].join(" "))}
	//
	// ${term.bold(">")} ${term.boldGreen("ok:")} ${term.bold(
	// 		`Serving your app on port ${PORT} (SSG); ${term.boldUnderline(`http://localhost:${PORT}`)}${term.bold(".")}`,
	// 	)}
	//
	// ${term.bold(`When you’re ready to stop the server, press Ctrl-C.`)}
	// )
	// }, 10)
	// server.listen(PORT)
}

// ;(() => {
// 	try {
// 		serve()
// 	} catch (err) {
// 		errored = true
// 		err.message = "An unexpected error occurred while trying to serve your web app; " + err.message
// 		log.error(err)
// 	}
// })()

export default serve
