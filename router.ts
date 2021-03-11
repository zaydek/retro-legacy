import * as http from "http"

export type Request = http.IncomingMessage
export type Response = http.ServerResponse
export type Handler = (req: Request, res: Response) => void | Promise<void>

export interface Server {
	handle(pathOrPattern: string | RegExp, handler: Handler): void
	listen(port: number): void
}

////////////////////////////////////////////////////////////////////////////////

export function createServer(): Server {
	const str_map: { [key: string]: Handler } = {}
	const regex_arr: { pattern: RegExp; handler: Handler }[] = []

	const srv: Server = {
		handle(pathOrPattern, handler) {
			// Handle paths:
			if (typeof pathOrPattern === "string") {
				const path = pathOrPattern // Use path
				str_map[path] = handler
				return
			}
			// Handle patterns:
			if (pathOrPattern instanceof RegExp) {
				const pattern = pathOrPattern // Use pattern
				regex_arr.push({ pattern, handler })
				return
			}
		},
		listen(port: number) {
			let epoch = 0

			function start(req: Request, res: Response): void {
				epoch = Date.now()
			}
			function end(req: Request, res: Response): void {
				console.log(`${req.method!} ${req.url!} - ${Date.now() - epoch}ms`)
			}

			const srv = http.createServer(async (req, res) => {
				start(req, res)

				// Handle paths:
				const handler = str_map[req.url!]
				if (handler !== undefined) {
					handler(req, res)
					end(req, res)
					return
				}
				// Handle patterns:
				for (const { pattern, handler } of regex_arr) {
					if (pattern.test(req.url!)) {
						handler(req, res)
						end(req, res)
						return
					}
				}
				res.writeHead(404, { "Content-Type": "text/plain" })
				res.end("404 - Not Found")
				end(req, res)
			})
			srv.listen(port)
		},
	}
	return srv
}

////////////////////////////////////////////////////////////////////////////////

const srv = createServer()

export function handle(path: string | RegExp, handler: Handler): void {
	srv.handle(path, handler)
}

export function listen(port: number): void {
	srv.listen(port)
}
