import ReactDOMServer from "react-dom/server"
import { detab } from "../../utils"
import { Request } from "./types"
import fs from ".fs"

// prettier-ignore
interface ResponseItem {
	head: string // Pre-rendered `<Head>` element
	root: any    // Pre-rendered `<Root>` element
}

// prettier-ignore
interface Response {
	[key: string]: ResponseItem
}

// TODO: Change to a server micro-service architecture later; no-ops the needs
// for intercommunicating processes over stdout and stderr, which is
// questionable at best.
export async function asyncRun(request: Request) {
	// const chain = []
	// for (const page of request.router) {
	// 	const p = new Promise<ResponseItem>(async resolve => {
	// 		// TODO: Add guards to check whether `props` returns data synchronously or
	// 		// returns an asynchronous promise.
	// 		const exports = require("../" + page.path)
	// 		let resolvedProps = null
	// 		if (exports.props) {
	// 			resolvedProps = await exports.props()
	// 		}
	// 		resolve({ page: page.page, props: resolvedProps })
	// 	})
	// 	chain.push(p)
	// }
	// const resolved = await Promise.all(chain)
	// const response = resolved.reduce((acc, page) => {
	// 	acc[page.page] = page.props
	// 	return acc
	// }, {} as Response)
	// return response

	// let Document = null
	// // prettier-ignore
	// if (fs.existsSync(conf.PAGES_DIR + "/internal/document.tsx")) {
	// 	Document = require("../" +  conf.PAGES_DIR + "/internal/document.tsx").default
	// }

	let Document: null | React.ReactElement = null
	if (fs.existsSync(request.config.PAGES_DIR + "/internal/document.tsx")) {
		Document = require("../" + request.config.PAGES_DIR + "/internal/document.tsx").default
	}

	let App: null | React.ReactElement = null
	if (fs.existsSync(request.config.PAGES_DIR + "/internal/document.tsx")) {
		App = require("../" + request.config.PAGES_DIR + "/internal/app.tsx").default
	}

	const chain = []
	for (const page of request.router) {
		const promise = new Promise<Response>(() => {
			const { default: Page, head: Head } = require("../" + request.config.PAGES_DIR + "/" + page)
			const pageProps = require("../" + request.config.CACHE_DIR + "/pageProps.js")

			// TODO: Change to `<Head>` and `<Root>`.
			let out = ""

			// TODO: Can we format `ReactDOMServer.renderToStaticMarkup(<Head />)`?
			// Maybe we can use `React.Children` here?
			if (!Document) {
				out = detab(`
					<!DOCTYPE html>
					<html lang="en">
						<head>
							<meta charset="utf-8">
							<meta name="viewport" content="width=device-width, initial-scale=1">
							${!Head ? "" : ReactDOMServer.renderToStaticMarkup(<Head />)}
						</head>
						<body>
							<noscript>You need to enable JavaScript to run this app.</noscript>
							<div id="root">${ReactDOMServer.renderToString(
								!App ? (
									<Page {...pageProps[route.page]} />
								) : (
									<App {...pageProps[route.page]}>
										<Page {...pageProps[route.page]} />
									</App>
								),
							)}</div>
							<script src="/app.js"></script>
						</body>
					</html>`)
			} else {
				out = detab(`
					<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
						<Document
							Head={Head || (() => null)}
							Root={() => (
								<>
									<div
										id="root"
										dangerouslySetInnerHTML={{
											__html: ReactDOMServer.renderToString(
												!App ? (
													<Page {...pageProps[route.page]} />
												) : (
													<App {...pageProps[route.page]}>
														<Page {...pageProps[route.page]} />
													</App>
												),
											),
										}}
									/>
									<script src="/app.js" />
								</>
							)}
						/>,
					)}`)
			}

			// fs.writeFileSync(conf.BUILD_DIR + "/" + basename + ".html", out + "\n")

			// TODO: Change to `resolve`.
		})
		chain.push(promise)
	}

	// await Promise.all(ps)

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
