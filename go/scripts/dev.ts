import * as esbuild from "esbuild"
import * as fs from "fs"
import * as fsPromises from "fs/promises"
import * as http from "http"
import * as p from "path"
import * as process from "process"
import * as types from "./types"

////////////////////////////////////////////////////////////////////////////////

type EventType = "ping" | "build-page" | "rebuild-app" | "shutdown"

type Handler = (req: http.IncomingMessage, res: http.ServerResponse, body: string) => Promise<void>

////////////////////////////////////////////////////////////////////////////////

let runtime: types.Runtime
let incrementalEsbuildResult: esbuild.BuildResult

// handleRebuildApp rebuilds __cache__/app.js to __export__.
//
// TODO: If a user adds a page during retro dev, Retro does not recreate the
// filesystem router.
//
// NOTE: The leverage Go is providing is the filesystem router, colored-terminal
// output (CLI is non-interactive), server guards, an HTTP server for serve, and
// server sent events for dev.
//
// The problem this introduces is that it makes it harder to regenerate the
// filesystem router at runtime. In theory we can increase the scope of our
// Node.js implementation to support more server types, but then we have to ask
// whether it’s better to implement the whole system in TypeScript or just a
// subsystem.
//
// The point about server sent events is interesting because in order to do this
// with a coupled Go and Node.js architecture, we have to create an HTTP server
// in Go that Node.js can request. This increases the complexity scope of what
// we’re trying to achieve.
//
// It may very well be better to implement the whole system in TypeScript to
// avoid doubly engineering Retro.
const buildRebuildApp: Handler = async (req, res, body) => {
	res.end("TODO")
}

// handleBuildPage builds an intermediary page __cache__/src/pages and then
// builds the final page to __export__. The intermediary step is because
// React.renderToString cannot parse JSX or TypeScript.
const handleBuildPage: Handler = async (req, res, body) => {
	res.end("TODO")
}

const handleEnd: Handler = async (req, res, body) => {
	res.end("TODO")
}

async function run(): Promise<void> {
	const srv = http.createServer((req, res) => {
		let body = ""
		req.on("data", chunk => {
			body += chunk
		})
		req.on("end", async () => {
			res.writeHead(200)
			const e: { type: EventType } = JSON.parse(body)
			switch (e.type) {
				case "ping":
					res.end("pong")
					return
				case "rebuild-app":
					await buildRebuildApp(req, res, body)
					return
				case "build-page":
					await handleBuildPage(req, res, body)
					return
				case "shutdown":
					await handleEnd(req, res, body)
					return
			}
		})
	})
	srv.listen(8033) // TODO
}

;(async () => {
	try {
		// Read stdin and parse the runtime:
		const stdin = fs.readFileSync(process.stdin.fd).toString()
		runtime = JSON.parse(stdin)

		// Save the runtime to __cache__/runtime.debug.json:
		const path = p.join(runtime.directoryConfiguration.cacheDir, "runtime.debug.json")
		await fsPromises.mkdir(p.dirname(path), { recursive: true })
		await fsPromises.writeFile(path, stdin + "\n") // EOF

		await run()
	} catch (error) {
		console.error(error.stack)
	}
})()
