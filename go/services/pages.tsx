import fs from "fs"
import { format } from "prettier"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { Request } from "./types"

// prettier-ignore
interface ResponseItem {
	page: string

	document: string // Pre-rendered `<Document>` element
	head:     string // Pre-rendered `<Head>` element
	root:     string // Pre-rendered `<Root>` element
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

	const pageProps = require("../" + request.config.CACHE_DIR + "/pageProps.js")

	let Document: null | React.ElementType = null
	if (fs.existsSync(request.config.PAGES_DIR + "/internal/document.tsx")) {
		Document = require("../" + request.config.PAGES_DIR + "/internal/document.tsx").default
	}

	let App: null | React.ElementType = null
	if (fs.existsSync(request.config.PAGES_DIR + "/internal/document.tsx")) {
		App = require("../" + request.config.PAGES_DIR + "/internal/app.tsx").default
	}

	for (const page of request.router) {
		const promise = new Promise<ResponseItem>(resolve => {
			const { default: Root, head: Head } = require("../" + page.path)

			let document = ""
			if (Document && typeof Document === "function") {
				document = ReactDOMServer.renderToStaticMarkup(
					<Document Head="%%SECRET_INTERNALS__HEAD%%" Root="%%SECRET_INTERNALS__ROOT%%" />,
				)
			}

			let head = ""
			if (Head && typeof Head === "function") {
				head = ReactDOMServer.renderToStaticMarkup(<Head />)
			}

			let root = ""
			if (Root && typeof Root === "function") {
				root = ReactDOMServer.renderToString(
					!App ? (
						<Root {...pageProps[page.page]} />
					) : (
						<App {...pageProps[page.page]}>
							<Root {...pageProps[page.page]} />
						</App>
					),
				)
			}

			resolve({ page: page.page, document, head, root })
		})
		chain.push(promise)
	}

	const resolved = await Promise.all(chain)
	return resolved

	// const resolved = await Promise.all(chain)
	// const response = resolved.reduce((acc, each) => {
	// 	acc[each.page] = each
	// 	return acc
	// }, {} as Response)
	// return response
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
