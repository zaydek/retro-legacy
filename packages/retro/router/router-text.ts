import * as log from "../../lib/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "../types"

// TODO: newRouteFromRouteMeta()

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export async function renderRouteMetaToString(tmpl: string, meta: types.RouteMeta): Promise<string> {
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
	let body = ""
	body += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	body += `\n\t\t<div id="root"></div>`
	body += `\n\t\t<script src="/app.js"></script>`

	try {
		if (typeof meta.module.default === "function") {
			const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps))
			body = body.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`)
		}
	} catch (err) {
		log.error(`${meta.routeInfo.src}.<Page>: ${err.message}`)
	}

	const out = tmpl
		.replace("%head%", head) // %head% -> <Head>
		.replace("%page%", body) // %page% -> <Page>
	return out
}

// TODO: newRouterFromPages?()

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export async function renderRouterToString(router: types.Router): Promise<string> {
	const map = new Map<string, string>()
	for (const meta of Object.values(router)) {
		map.set(meta.routeInfo.src, meta.routeInfo.component)
	}

	const routes = Array.from(map)

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${routes.map(([src, component]) => `import ${component} from "../${src}"`).join("\n")}

export default function App() {
	return (
		<Router>
${
	Object.entries(router)
		.map(
			([path, meta]) => `
			<Route path="${path}">
				<${meta.routeInfo.component} {...${JSON.stringify(meta.descriptProps)}} />
			</Route>`,
		)
		.join("\n") + "\n"
}
		</Router>
	)
}

${
	JSON.parse(process.env.STRICT_MODE ?? "true") === "true"
		? `ReactDOM.${JSON.parse(process.env.RENDER ?? "false") === "true" ? "render" : "hydrate"}(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)`
		: `ReactDOM.${JSON.parse(process.env.RENDER ?? "false") === "true" ? "render" : "hydrate"}(
	<App />,
	document.getElementById("root"),
)`
}
` // EOF
}
