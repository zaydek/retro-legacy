import * as log from "../../shared/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "../types"

// TODO: newRouteFromRouteMeta()

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export function renderRouteMetaToString(template: string, meta: types.RouteMeta, { dev }: { dev: boolean }): string {
	let head = "<!-- <Head { path, ...serverProps }> -->"
	try {
		if (typeof meta.module.Head === "function") {
			const str = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.module.Head, meta.descriptProps))
			head = str.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (error) {
		log.error(`${meta.routeInfo.src}.<Head>: ${error.message}`)
	}

	// TODO: Upgrade to <script src="/app.[hash].js">?
	let body = ""
	body += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	body += `\n\t\t<div id="root"></div>`
	body += `\n\t\t<script src="/app.js"></script>`
	body += !dev ? "" : `\n\t\t<script type="module">`
	body += !dev ? "" : `\n\t\t\tconst events = new EventSource("/~dev")`
	body += !dev ? "" : `\n\t\t\tevents.addEventListener("reload", e => window.location.reload())`
	body += !dev ? "" : `\n\t\t\tevents.addEventListener("warning", e => console.warn(JSON.parse(e.data)))`
	body += !dev ? "" : `\n\t\t</script>`

	try {
		if (typeof meta.module.default === "function") {
			const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps))
			body = body.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`)
		}
	} catch (error) {
		log.error(`${meta.routeInfo.src}.<Page>: ${error.message}`)
	}

	const contents = template.replace("%head%", head).replace("%page%", body)
	return contents
}

// TODO: newRouterFromPages?()

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export function renderRouterToString(router: types.Router): string {
	const map = new Map<string, string>()
	for (const meta of Object.values(router)) {
		map.set(meta.routeInfo.src, meta.routeInfo.component)
	}

	const distinct = Array.from(map)

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${distinct.map(([src, component]) => `import ${component} from "../${src}"`).join("\n")}

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

ReactDOM.hydrate(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)
` // EOF
}

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
