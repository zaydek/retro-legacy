import fs from "fs"
import guardServer from "./guardServer"
import React from "react"
import ReactDOMServer from "react-dom/server"
import { detab } from "./utils"

// Prerenders HTML and `pageProps` on the server.
async function run() {
	guardServer()

	const srcs = fs.readdirSync("pages").filter((each: string) => {
		return !each.startsWith("_document") && each.endsWith(".tsx")
	})

	// Prerender page props.
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const { load } = require("../pages/" + each)
		let response = null
		if (load) {
			response = await load()
		}
		const pageProps = require("../cache/__pageProps.json")
		pageProps[basename] = response
		fs.writeFileSync("cache/__pageProps.json", JSON.stringify(pageProps, null, "\t"))
	}

	// Prerender pages.
	//
	// TODO: Add conditional logic for `<Document>`.
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const { default: Page, head: Head } = require("../pages/" + each)
		const pageProps = require("../cache/__pageProps.json")

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
						<div id="root">${ReactDOMServer.renderToString(<Page data={pageProps[basename]} />)}</div>
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
										__html: ReactDOMServer.renderToString(<Page data={pageProps[basename]} />),
									}}
								/>
								<script src={`/${basename}.js`} />
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

;(async () => {
	await run()
})()
