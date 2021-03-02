import * as log from "../lib/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export async function renderRouteMetaToString(runtime: types.Runtime, meta: types.RouteMeta): Promise<string> {
	let head = "<!-- <Head { path, ...serverProps }> -->"
	try {
		if (typeof meta.module.Head === "function") {
			const str = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.module.Head, meta.descriptProps))
			head = str.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (err) {
		log.error(`${meta.routeInfo.src}.<Head>: ${err.message}`)
	}

	// TODO: Upgrade <script src="/app.js"> to <script src="/app.[hash].js">?
	// TODO: Add support for SSE here?
	let body = `<noscript>You need to enable JavaScript to run this app.</noscript>\n\t\t<div id="root"></div>\n\t\t<script src="/app.js"></script>`
	try {
		if (typeof meta.module.default === "function") {
			const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps))
			body = body.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`)
		}
	} catch (err) {
		log.error(`${meta.routeInfo.src}.<Page>: ${err.message}`)
	}

	const out = runtime.document
		.replace("%head%", head) // %head% -> <Head>
		.replace("%page%", body) // %page% -> <Page>
	return out
}

// // TODO: Add support for <Layout> components.
// // TODO: Write tests.
// export async function renderRouterToString(runtime: types.Runtime): Promise<string> {
// 	const distinctComponents = [...new Set(runtime.pageInfos.map(each => each.component))] // TODO: Change to router?
//
// 	const distinctRoutes = runtime.pageInfos
// 		.filter(route => distinctComponents.includes(route.component))
// 		.sort((a, b) => a.component.localeCompare(b.component))
//
// 	return `import React from "react"
// import ReactDOM from "react-dom"
// import { Route, Router } from "../packages/router"
//
// // Components
// ${distinctRoutes.map(route => `import ${route.component} from "../${route.src}"`).join("\n")}
//
// export default function App() {
// 	return (
// 		<Router>
// ${
// 	Object.entries(runtime.router)
// 		.map(
// 			([path, meta]) => `
// 			<Route path="${path}">
// 				<${meta.route.component} {...${JSON.stringify(meta.props)}} />
// 			</Route>`,
// 		)
// 		.join("\n") + "\n"
// }
// 		</Router>
// 	)
// }
//
// ${
// 	JSON.parse(process.env.STRICT_MODE ?? "true") === "true"
// 		? `ReactDOM.${JSON.parse(process.env.RENDER ?? "false") === "true" ? "render" : "hydrate"}(
// 	<React.StrictMode>
// 		<App />
// 	</React.StrictMode>,
// 	document.getElementById("root"),
// )`
// 		: `ReactDOM.${JSON.parse(process.env.RENDER ?? "false") === "true" ? "render" : "hydrate"}(
// 	<App />,
// 	document.getElementById("root"),
// )`
// }
// ` // EOF
// }
