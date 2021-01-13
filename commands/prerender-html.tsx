import conf from "./conf"
import fs from "fs"
import path from "path"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { detab } from "../utils"
import { getPageSrcs, serverGuards } from "./utils"
import { parseRouteInfo } from "../Router/parts"

// Prerenders HTML on the server.
//
// TODO: Change to `asyncRun`.
function run() {
	serverGuards()

	const srcs = getPageSrcs()
	for (const src of srcs) {
		const basename = path.parse(src).name
		const routeInfo = parseRouteInfo("/" + basename)
		if (routeInfo === null) {
			throw new Error(`prerender-html: parseRouteInfo(${JSON.stringify(basename)})`)
		}

		const { default: Page, head: Head } = require("../" + conf.PAGES_DIR + "/" + src) // FIXME: Change `/` for COMPAT
		const props = require("../" + conf.CACHE_DIR + "/props.generated.json") // FIXME: Change `/` for COMPAT

		let pageStr = ""

		// TODO: `_html.tsx` should work for non-`.tsx` extensions.
		let HTML = null
		// prettier-ignore
		if (fs.existsSync(conf.PAGES_DIR + "/_html.tsx")) {// FIXME: Change `/` for COMPAT
			HTML = require("../" +  conf.PAGES_DIR + "/_html.tsx").default // FIXME: Change `/` for COMPAT
		}

		// TODO: Can we format `ReactDOMServer.renderToStaticMarkup(<Head />)`?
		if (!HTML) {
			pageStr = detab(`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						${!Head ? "" : ReactDOMServer.renderToStaticMarkup(<Head />)}
					</head>
					<body>
						<noscript>You need to enable JavaScript to run this app.</noscript>
						<div id="root">${ReactDOMServer.renderToString(<Page {...props[routeInfo.component]} />)}</div>
						<script src="/app.js"></script>
					</body>
				</html>`)
		} else {
			pageStr = `<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
				<HTML
					Head={Head || (() => null)}
					Root={() => (
						<>
							<div
								id="root"
								dangerouslySetInnerHTML={{
									__html: ReactDOMServer.renderToString(<Page {...props[routeInfo.component]} />),
								}}
							/>
							<script src="/app.js" />
						</>
					)}
				/>,
			)}`
		}

		fs.writeFileSync(conf.BUILD_DIR + "/" + basename + ".html", pageStr + "\n") // FIXME: Change `/` for COMPAT
	}
}

;(() => {
	run()
})()
