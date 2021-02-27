import * as server from "./server"

function run(): void {
	try {
		server.middleware((req: server.Request, _: server.Response): void => {
			const d = new Date()
			console.log(`${d.toLocaleDateString()} ${d.toLocaleTimeString()}: '${req.method} ${req.url}'`)
		})
		server.handle("/", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/"`)
		})
		server.handle("/a", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a"`)
		})
		server.handle("/a/", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a/"`)
		})
		server.handle("/a/b", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a/b"`)
		})
		server.handle("/a/b/", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a/b/"`)
		})
		server.handle("/a/b/c", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a/b/c"`)
		})
		server.handle("/a/b/c/", (_: server.Request, res: server.Response): void => {
			res.writeHead(200, { "Content-Type": "text/plain" })
			res.end(`Hello, world! "/a/b/c/"`)
		})
		server.listen(8000)
	} catch (err) {
		console.error(err)
	}
}

run()
