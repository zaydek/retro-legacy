import * as log from "../../shared/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as T from "../types"

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export function routeMetaToString(tmpl: string, meta: T.RouteMeta, { devMode }: { devMode: boolean }): string {
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
	let app = ""
	app += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	app += `\n\t\t<div id="root"></div>`
	app += `\n\t\t<script src="/app.js"></script>`
	app += !devMode ? "" : `\n\t\t<script type="module">`
	app += !devMode ? "" : `\n\t\t\tconst events = new EventSource("/~dev")`
	app += !devMode ? "" : `\n\t\t\tevents.addEventListener("reload", e => window.location.reload())`
	app += !devMode ? "" : `\n\t\t\tevents.addEventListener("warning", e => console.warn(JSON.parse(e.data)))`
	app += !devMode ? "" : `\n\t\t</script>`

	try {
		if (typeof meta.module.default === "function") {
			const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps))
			app = app.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`)
		}
	} catch (error) {
		log.error(`${meta.routeInfo.src}.<Page>: ${error.message}`)
	}

	const contents = tmpl.replace("%head%", head).replace("%app%", app)
	return contents
}

// TODO: Add support for <Layout> components.
// TODO: Write tests.
export function routerToString(router: T.Router): string {
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
