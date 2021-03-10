import * as log from "../../shared/log"
import * as React from "react"
import * as ReactDOMServer from "react-dom/server"
import * as T from "../types"

// TODO: Add support for <Layout> components.
export function routeMetaToString(tmpl: string, meta: T.ServerRouteMeta, { dev }: { dev: boolean }): string {
	let head = "<!-- <Head { path, ...serverProps }> -->"
	try {
		if (typeof meta.module.Head === "function") {
			const str = ReactDOMServer.renderToStaticMarkup(React.createElement(meta.module.Head, meta.descriptProps))
			head = str.replace(/></g, ">\n\t\t<").replace(/\/>/g, " />")
		}
	} catch (error) {
		log.fatal(`${meta.route.src}.<Head>: ${error.message}`)
	}

	// TODO: Upgrade to <script src="/app.[hash].js">?
	let app = ""
	app += `<noscript>You need to enable JavaScript to run this app.</noscript>`
	app += `\n\t\t<div id="root"></div>`
	app += `\n\t\t<script src="/app.js"></script>`
	app += !dev ? "" : `\n\t\t<script type="module">`
	app += !dev ? "" : `\n\t\t\tconst events = new EventSource("/~dev")`
	app += !dev ? "" : `\n\t\t\tevents.addEventListener("reload", e => window.location.reload())`
	app += !dev ? "" : `\n\t\t\tevents.addEventListener("warning", e => console.warn(JSON.parse(e.data)))`
	app += !dev ? "" : `\n\t\t</script>`

	try {
		const str = ReactDOMServer.renderToString(React.createElement(meta.module.default, meta.descriptProps))
		app = app.replace(`<div id="root"></div>`, `<div id="root">${str}</div>`)
	} catch (error) {
		log.fatal(`${meta.route.src}.<Page>: ${error.message}`)
	}

	const contents = tmpl.replace("%head%", head).replace("%app%", app)
	return contents
}

// TODO: Add support for <Layout> components.
export function routerToString(router: T.ServerRouter): string {
	const map = new Map()
	for (const meta of Object.values(router)) {
		map.set(meta.route.component, meta.route.src)
	}

	const imports = Array.from(map)

	return `import React from "react"
import ReactDOM from "react-dom"

${imports.map(([component, src]) => `import ${component} from "../${src}"`).join("\n")}

import { Route, Router } from "../packages/router"

export default function App() {
	return (
		<Router>
${
	Object.entries(router)
		.map(
			([path, meta]) => `
			<Route path="${path}">
				<${meta.route.component} {...${JSON.stringify(meta.descriptProps)}} />
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
