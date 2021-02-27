import * as http from "http"

export type Request = http.IncomingMessage
export type Response = http.ServerResponse

export type Handler = (req: Request, res: Response) => void | Promise<void>

export interface Server {
	middleware(...handlers: Handler[]): void
	handle(path: string, handler: Handler): void
	listen(port: number): void
}

////////////////////////////////////////////////////////////////////////////////

// createServer creates a new server that accepts middlewares and path-based
// handlers.
export function createServer(): Server {
	const middlewares: Handler[] = []
	const handlers: { [key: string]: Handler } = {}

	return {
		middleware(...handlers: Handler[]): void {
			middlewares.push(...handlers)
		},
		handle(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
			handlers[path] = handler
		},
		listen(port: number): void {
			const srv = http.createServer(
				async (req: Request, res: Response): Promise<void> => {
					for (const middleware of middlewares) {
						await middleware(req, res)
					}
					const handler = handlers[req.url!]
					if (handler === undefined) {
						res.writeHead(404, { "Content-Type": "text/plain" })
						res.end("404 - Not Found")
						return
					}
					await handler(req, res)
				},
			)
			srv.listen(port)
		},
	}
}

////////////////////////////////////////////////////////////////////////////////

const srv = createServer()

export function middleware(...handlers: Handler[]): void {
	srv.middleware(...handlers)
}

export function handle(path: string, handler: (req: Request, res: Response) => void | Promise<void>): void {
	srv.handle(path, handler)
}

export function listen(port: number): void {
	srv.listen(port)
}
