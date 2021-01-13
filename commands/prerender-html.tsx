// import seedHash from "./seedHash"

import conf from "./conf"
import fs from "fs"
import path from "path"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { detab } from "../utils"
import { getPageSrcs, serverGuards } from "./utils"
import { parseRoutes } from "../Router/parts"

const App = require("../" + conf.PAGES_DIR + "/internal/app.tsx").default // FIXME: Change `/` for COMPAT

// Prerenders HTML on the server.
//
// TODO: Extract API to be more testable? `buildPromise(pageName, app)`?
async function asyncRun() {
	serverGuards()

	const ps = []

	const srcs = getPageSrcs()
	for (const src of srcs) {
		const p = new Promise(() => {
			const basename = path.parse(src).name
			const route = parseRoutes("/" + basename)
			if (route === null) {
				throw new Error(`prerender-html: parseRoutes(${JSON.stringify(basename)})`)
			}

			const { default: Page, head: Head } = require("../" + conf.PAGES_DIR + "/" + src) // FIXME: Change `/` for COMPAT
			const pageProps = require("../" + conf.CACHE_DIR + "/pageProps.js") // FIXME: Change `/` for COMPAT

			let out = ""

			let Document = null
			// prettier-ignore
			if (fs.existsSync(conf.PAGES_DIR + "/internal/document.tsx")) { // FIXME: Change `/` for COMPAT
				Document = require("../" +  conf.PAGES_DIR + "/internal/document.tsx").default // FIXME: Change `/` for COMPAT
			}

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

			fs.writeFileSync(conf.BUILD_DIR + "/" + basename + ".html", out + "\n") // FIXME: Change `/` for COMPAT
		})
		ps.push(p)
	}

	await Promise.all(ps)
}
;(() => {
	asyncRun()
})()
