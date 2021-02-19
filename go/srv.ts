import * as http from "http"

interface Payload {
	type: string
	data: string
}

function handlePing() {
	// ...
}

function handlePong() {
	// ...
}

async function run(): Promise<void> {
	const srv = http.createServer((req, res) => {
		let body = ""
		req.on("data", chunk => {
			body += chunk
		})
		req.on("end", function () {
			res.writeHead(200)
			const data: Payload = JSON.parse(body)
			if (data.type === "greet") {
				res.end(`Hello, ${data.data}!`)
			}
		})
	})
	console.log("Serving on port 8000")
	srv.listen(8000)
}

run()
