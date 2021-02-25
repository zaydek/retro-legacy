import * as http from "http"

async function run(): Promise<void> {
	const server = http.createServer(async (req, res) => {
		if (req.url === "/__events__") {
			res.writeHead(200, {
				"Content-Type": "text/event-stream",
				"Cache-Control": "no-cache",
				Connection: "keep-alive",
			})
			setInterval(() => {
				res.write("event: reload\ndata\n\n")
			}, 1e3)
			return
		}
		res.writeHead(404, { "Content-Type": "text/plain" })
		res.end("404 - Not Found")
	})
	server.listen("8000")
}

run()
