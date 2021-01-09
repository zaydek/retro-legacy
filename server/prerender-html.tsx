import Document from "../pages/_document"
import fs from "fs"
import guards from "./guards"
import React from "react"
import ReactDOMServer from "react-dom/server"

// Prerenders HTML and `pageProps` on the server.
async function run() {
	guards()

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
		fs.writeFileSync("cache/__pageProps.json", JSON.stringify(pageProps, null, 2))
	}

	// Prerender pages.
	//
	// TODO: Add conditional logic for `<Document>`.
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const { default: Page, head: metadata } = require("../pages/" + each)
		const pageProps = require("../cache/__pageProps.json")
		const pageStr = `<!DOCTYPE html>${ReactDOMServer.renderToString(
			<Document basename={basename} metadata={metadata}>
				<Page data={pageProps[basename]} />
			</Document>,
		)}`

		fs.writeFileSync(`build/${basename}.html`, pageStr + "\n")
	}
}

;(async () => {
	await run()
})()

// <html lang="en">
// 	<head>
// 		<meta charSet="utf-8" />
// 		<meta name="viewport" content="width=device-width, initial-scale=1" />
// 		{Metadata && <Metadata />}
// 	</head>
// 	<body>
// 		<noscript>You need to enable JavaScript to run this app.</noscript>
// 		<div id="root">{children}</div>
// 		<script src="/out.js"></script>
// 	</body>
// </html>
