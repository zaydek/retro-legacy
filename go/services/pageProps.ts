import { Request } from "./types"

// prettier-ignore
interface ResponseItem {
	page:  string
	props: any
}

// prettier-ignore
interface Response {
	[key: string]: ResponseItem
}

// TODO: Change to a server micro-service architecture later; no-ops the needs
// for intercommunicating processes over stdout and stderr, which is
// questionable at best.
export async function asyncRun(request: Request) {
	const chain = []
	for (const page of request.router) {
		const p = new Promise<ResponseItem>(async resolve => {
			// TODO: Add guards to check whether `props` returns data synchronously or
			// returns an asynchronous promise.
			const exports = require("../" + page.path)
			let resolvedProps = null
			if (exports.props) {
				resolvedProps = await exports.props()
			}
			resolve({ page: page.page, props: resolvedProps })
		})
		chain.push(p)
	}
	const resolved = await Promise.all(chain)
	const response = resolved.reduce((acc, page) => {
		acc[page.page] = page.props
		return acc
	}, {} as Response)
	return response
}

// TODO: Is there a way to inject the current filename?
;(async () => {
	const jsonRequest = process.argv[process.argv.length - 1]
	if (!jsonRequest) {
		throw new Error(`pageProps.ts: JSON router should never be undefined or empty; jsonRequest=${jsonRequest}`)
	}
	const request: Request = JSON.parse(jsonRequest)
	const response = await asyncRun(request)
	const jsonResponse = JSON.stringify(response, null, "\t")
	console.log(jsonResponse)
})()

process.on("uncaughtException", err => {
	console.error(err)
	process.exit(1)
})
