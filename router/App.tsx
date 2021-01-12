import fs from "fs"
import path from "path"
import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "./Router"

function getPageComponents() {
	const paths = fs.readdirSync("./router")

	// prettier-ignore
	const filteredPaths = paths.filter(each => {
		const ok = (
			fs.statSync("./router/" + each).isFile() &&
			path.parse("./router/" + each).ext === ".tsx" &&
			each !== "App.tsx"
		)
		return ok
	})

	const pages = filteredPaths.map(each => path.parse(each).name)
	const components = pages.map(each => {
		try {
			return require(`./${each}.tsx`).default
		} catch (err) {}
	})
	return { pages, components }
}

// console.log(getPageComponents())
const { pages, components } = getPageComponents()

// console.log(pages.map(each => `import ${each} from ${JSON.stringify("./" + each)}`))
console.log(
	`
import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "./Router"

${pages.map(each => `import ${each} from ${JSON.stringify("./" + each)}`).join("\n")}

export default function RoutedApp() {
	return (
		<Router>
			${pages
				.map(
					each => `
			<Route page=${JSON.stringify("/" + each)}>
				<${each} />
			</Route>
`,
				)
				.join("")}
		</Router>
	)
}
`.trimStart(),
)

// {${JSON.stringify(pages)}.map((Each, x) => (
// 	<Route page={pages[x]}>
// 		<Each />
// 	</Route>
// ))}

// function App() {
// 	return (
// 		<Router>
// 			{components.map((Each, x) => (
// 				<Route page={pages[x]!}>
// 					<Each />
// 				</Route>
// 			))}
// 		</Router>
// 	)
// }

// ReactDOM.render(<App />, document.getElementById("root"))
