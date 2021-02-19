import * as http from "http"
import * as types from "./types"

// Pong!
interface PingEvent {
	type: "ping"
}

// StartEvent generates app.js (no page).
interface StartEvent {
	type: "start"
}

// RebuildEvent regenerates app.js and render the current page.
interface RebuildEvent {
	type: "rebuild"
	data: {
		filesystemRoute: types.FilesystemRoute
	}
}

// EndEvent ends the server.
interface EndEvent {
	type: "end"
}

type Event = PingEvent | StartEvent | RebuildEvent | EndEvent

let runtime: types.Runtime

async function handlePing(
	// prettier-ignore
	req: http.IncomingMessage,
	res: http.ServerResponse,
	body: string,
): Promise<void> {
	res.end("pong")
}

async function handleStart(
	// prettier-ignore
	req: http.IncomingMessage,
	res: http.ServerResponse,
	body: string,
): Promise<void> {
	res.end("TODO")
}

async function handleRebuild(
	// prettier-ignore
	req: http.IncomingMessage,
	res: http.ServerResponse,
	body: string,
): Promise<void> {
	res.end("TODO")
}

async function handleEnd(
	// prettier-ignore
	req: http.IncomingMessage,
	res: http.ServerResponse,
	body: string,
): Promise<void> {
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
			const e: Event = JSON.parse(body)
			if (e.type === "ping") {
				await handlePing(req, res, body)
			} else if (e.type === "start") {
				await handleStart(req, res, body)
			} else if (e.type === "rebuild") {
				await handleRebuild(req, res, body)
			} else if (e.type === "end") {
				await handleEnd(req, res, body)
			}
		})
	})
	srv.listen(8000)
}

;(async () => {
	try {
		runtime = require("../__cache__/runtime.json")
		await run()
	} catch (error) {
		console.error(error.stack)
	}
})()
