import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "./Router"

import PageHello from "./hello"
import PageWorld from "./world"

export default function App() {
	return (
		<Router>
			
			<Route page="/hello">
				<PageHello />
			</Route>

			<Route page="/world">
				<PageWorld />
			</Route>

		</Router>
	)
}

ReactDOM.render(
	<App />,
	document.getElementById("root"),
)
