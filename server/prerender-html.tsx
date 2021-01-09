import fs from "fs"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { detab, getPageSrcs, guards } from "./utils"

// Prerenders HTML and props on the server.
function run() {
	guards()

	// Prerender pages.
	const srcs = getPageSrcs()
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const { default: Page, head: Head } = require("../pages/" + each)
		const props = require("../cache/__props.json")

		// The page rendered as a string.
		let pageStr = ""

		// The custom document component.
		let Document = null
		try {
			Document = require("../pages/_document.tsx").default
		} catch (_) {}

		if (!Document) {
			// Does not use `_document.tsx`:
			pageStr = detab(`
				<!DOCTYPE html>
				<html lang="en">
					<head>
						<meta charset="utf-8">
						<meta name="viewport" content="width=device-width, initial-scale=1">
						${!Head ? "" : ReactDOMServer.renderToStaticMarkup(<Head />)}
						<Head>
					</head>
					<body>
						<noscript>You need to enable JavaScript to run this app.</noscript>
						<div id="root">${ReactDOMServer.renderToString(<Page data={props[basename]} />)}</div>
						<script src="/react.out.js"></script>
						<script src="/${basename}.js"></script>
					</body>
				</html>
			`)
		} else {
			// Uses `_document.tsx`:
			pageStr = detab(
				`<!DOCTYPE html>${ReactDOMServer.renderToStaticMarkup(
					<Document
						Head={Head || (() => null)}
						Root={() => (
							<>
								<div
									id="root"
									dangerouslySetInnerHTML={{
										__html: ReactDOMServer.renderToString(<Page data={props[basename]} />),
									}}
								/>
								<script src="/react.out.js" />
								<script src={`/${basename}.out.js`} />
							</>
						)}
					/>,
				)}`,
			)
			pageStr += "\n" // EOF
		}

		fs.writeFileSync(`build/${basename}.html`, pageStr)
	}
}

;(() => {
	run()
})()
