import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "./Router"

import Hello from "./[hello]"
import PageA from "./page-a"
import PageB from "./page-b"

export default function RoutedApp() {
	return (
		<Router>
			<Route page="/[hello]">
				<Hello />
			</Route>

			<Route page="/page-b">
				<PageA />
			</Route>

			<Route page="/page-b">
				<PageB />
			</Route>
		</Router>
	)
}
