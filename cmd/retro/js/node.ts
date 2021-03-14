import * as T from "./T"
import { readline, stderr, stdout } from "./utils"

const RESOLVE_ROUTER = "resolve-router"

// function resolveRouter() {}
//
// function resolveRoute() {}
//
// function run() {}

interface Router {
	// ...
}

async function resolveRouter(runtime: T.Runtime): Promise<Router> {
	stdout(JSON.stringify(runtime.Routes, null, 2))
	// for (const route of runtime.Routes) {
	// 	// stdout(route)
	// }
	const router: Router = {}
	return router
}

async function main(): Promise<void> {
	while (true) {
		const bstr = await readline()
		if (bstr === undefined) {
			break
		}
		const msg = JSON.parse(bstr)
		switch (msg.Kind) {
			case RESOLVE_ROUTER:
				const router = await resolveRouter(msg.Data)
				// stdout(router)
				break
			default:
				throw new Error("Internal error")
		}
	}
}

main()
