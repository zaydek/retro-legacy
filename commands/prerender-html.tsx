import fs from "fs"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { detab } from "../utils"
import { getPages, serverGuards } from "./utils"

const PAGEDIR = "pages"

// Prerenders HTML on the server.
function run() {
	serverGuards()

	const pages = getPages()
	console.log(pages)
	for (const each of pages) {
		const { default: Page, head: Head } = require("../" + PAGEDIR + "/" + each) // FIXME: Change `/` for COMPAT
		const props = require("../cache/props.generated.json") // FIXME: Change `/` for COMPAT

		let pageStr = ""

		//		// The custom document component.
		//		let Document = null
		//		try {
		//			Document = require("../pages/_document.tsx").default // FIXME: Change `/` for COMPAT
		//		} catch (_) {}
		//
		//		if (!Document) {
		//			// Does not use `_document.tsx`:
		//			pageStr = detab(`
		//				<!DOCTYPE html>
		//				<html lang="en">
		//					<head>
		//						<meta charset="utf-8">
		//						<meta name="viewport" content="width=device-width, initial-scale=1">
		//						${!Head ? "" : ReactDOMServer.renderToStaticMarkup(<Head />)}
		//						<Head>
		//					</head>
		//					<body>
		//						<noscript>You need to enable JavaScript to run this app.</noscript>
		//						<div id="root">${ReactDOMServer.renderToString(<Page {...props[each]} />)}</div>
		//						<script src="/app.js"></script>
		//					</body>
		//				</html>
		//			`)
		//		} else {
		//			// Uses `_document.tsx`:
		//			pageStr = detab(
		//				`<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
		//					<Document
		//						Head={Head || (() => null)}
		//						Root={() => (
		//							<>
		//								<div
		//									id="root"
		//									dangerouslySetInnerHTML={{
		//										__html: ReactDOMServer.renderToString(<Page {...props[each]} />),
		//									}}
		//								/>
		//								<script src="/app.js" />
		//							</>
		//						)}
		//					/>,
		//				)}`,
		//			)
		//			pageStr += "\n" // EOF
		//		}
		//
		//		fs.writeFileSync(`build/${each}.html`, pageStr)
	}
}

;(() => {
	run()
})()
