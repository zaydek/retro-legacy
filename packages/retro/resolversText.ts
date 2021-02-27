import * as log from "../lib/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as types from "./types"
import * as utils from "./utils"

////////////////////////////////////////////////////////////////////////////////

type renderRouteMetaToString = (runtime: types.Runtime, loaded: types.LoadedRouteMeta) => Promise<string>

type renderRouterToString = (runtime: types.Runtime<types.DevOrExportCommand>, router: types.Router) => Promise<string>

////////////////////////////////////////////////////////////////////////////////

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export const renderServerRouteMetaToString: renderRouteMetaToString = async (runtime, loaded) => {
	let head = "<!-- <Head> -->"
	try {
		if (typeof loaded.module.Head === "function") {
			const renderString = ReactDOMServer.renderToStaticMarkup(
				React.createElement(loaded.module.Head, loaded.meta.props),
			)
			head = renderString.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (err) {
		log.error(`${loaded.meta.route.src}.<Head>: ${err.message}`)
	}

	// TODO: Upgrade <script src="/app.js"> to <script src="/app.[hash].js">?
	let page = `<noscript>You need to enable JavaScript to run this app.</noscript>\n\t\t<div id="root"></div>\n\t\t<script src="/app.js"></script>`
	try {
		if (typeof loaded.module.default === "function") {
			const renderString = ReactDOMServer.renderToString(React.createElement(loaded.module.default, loaded.meta.props))
			page = page.replace(`<div id="root"></div>`, `<div id="root">${renderString}</div>`)
		}
	} catch (err) {
		log.error(`${loaded.meta.route.src}.<Page>: ${err.message}`)
	}

	const out = runtime.document
		.replace("%head%", head) // %head% -> <Head>
		.replace("%page%", page) // %page% -> <Page>
	return out
}

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export const renderServerRouterToString: renderRouterToString = async (runtime, router) => {
	const distinctComponents = [...new Set(runtime.pages.map(each => each.component))] // TODO: Change to router?

	const distinctRoutes = runtime.pages
		.filter(route => distinctComponents.includes(route.component))
		.sort((a, b) => a.component.localeCompare(b.component))

	return `import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../packages/router"

// Components
${distinctRoutes.map(route => `import ${route.component} from "../${route.src}"`).join("\n")}

export default function App() {
	return (
		<Router>
${
	Object.entries(router)
		.map(
			([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component}
					{...${utils.prettyJSON(JSON.stringify(meta.props))}
				} />
			</Route>`,
		)
		.join("\n") + "\n"
}
		</Router>
	)
}

${
	JSON.parse(process.env.STRICT_MODE || "true")
		? `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)`
		: `ReactDOM.${JSON.parse(process.env.RENDER || "false") ? "render" : "hydrate"}(
	<App />,
	document.getElementById("root"),
)`
}
` // EOF
}
