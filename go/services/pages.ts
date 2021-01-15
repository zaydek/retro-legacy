import { detab } from "../../utils"
import ReactDOMServer from "react-dom/server"
import { PageBasedRouter } from "./types"

// prettier-ignore
interface ResponsePayloadItem {
	head: string // Pre-rendered `<Head>` element
	root: any    // Pre-rendered `<Root>` element
}

type ResponsePayload = { [key: string]: ResponsePayloadItem }

// TODO: Change to a server micro-service architecture later; no-ops the needs
// for intercommunicating processes over stdout and stderr, which is
// questionable at best.
export async function asyncRun(router: PageBasedRouter) {
	// let Document = null
	// // prettier-ignore
	// if (fs.existsSync(conf.PAGES_DIR + "/internal/document.tsx")) { // FIXME: Change `/` for COMPAT
	// 	Document = require("../" +  conf.PAGES_DIR + "/internal/document.tsx").default // FIXME: Change `/` for COMPAT
	// }

	for (const page of router) {
		const p = new Promise(() => {
			const { default: Page, head: Head } = require("../" + conf.PAGES_DIR + "/" + page) // FIXME: Change `/` for COMPAT
			const pageProps = require("../" + conf.CACHE_DIR + "/pageProps.js") // FIXME: Change `/` for COMPAT

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

			fs.writeFileSync(conf.BUILD_DIR + "/" + basename + ".html", out + "\n") // FIXME: Change `/` for COMPAT
		})
		ps.push(p)
	}

	await Promise.all(ps)
}

// TODO: Is there a way to inject the current filename here?
;(async () => {
	const jsonPayload = process.argv[process.argv.length - 1]
	if (!jsonPayload) {
		throw new Error(`pages.ts: JSON router should never be undefined or empty; jsonIn=${jsonPayload}`)
	}
	const router: PageBasedRouter = JSON.parse(jsonPayload)
	const resPayload = await asyncRun(router)
	const jsonResPayload = JSON.stringify(resPayload, null, "\t")
	console.log(jsonResPayload)
})()

process.on("uncaughtException", err => {
	console.error(err)
	process.exit(1)
})
