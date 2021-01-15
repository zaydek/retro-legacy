interface PayloadItem {
	path: string
	pageName: string
	componentName: string
}

type Payload = PayloadItem[]

// TODO: Change to a server micro-service architecture later; no-ops the needs
// for intercommunicating processes over stdout and stderr, which is
// questionable at best.
// TODO: Move to some `services` or equivalent folder.
async function asyncRun(payload: Payload) {
	const chain = []
	for (const each of payload) {
		const p = new Promise<{
			pageName: string
			props: any
		}>(async resolve => {
			// TODO: Guard `props` synchronously returns data or returns an
			// asynchronous promise, etc.
			const exports = require("../" + each.path)
			let resolvedProps = null
			if (exports.props) {
				resolvedProps = await exports.props()
			}
			resolve({
				pageName: each.pageName,
				props: resolvedProps,
			})
		})
		chain.push(p)
	}
	const resolved = await Promise.all(chain)
	const responsePayload = resolved.reduce((acc, each) => {
		acc[each.pageName] = each.props
		return acc
	}, {} as { [key: string]: any })
	return responsePayload
}

;(async () => {
	const jsonPayload = process.argv[process.argv.length - 1]
	const payload: Payload = JSON.parse(jsonPayload!)
	const responsePayload = await asyncRun(payload)
	const jsonResponsePayload = JSON.stringify(responsePayload, null, "\t")
	console.log(jsonResponsePayload)
})()

process.on("uncaughtException", err => {
	console.error(err.stack) // TODO: Change to `err`?
	process.exit(1)
})
