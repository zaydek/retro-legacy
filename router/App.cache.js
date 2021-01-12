import React from "react"
import ReactDOM from "react-dom"

import Wrapper from "./_wrapper"
import { Route, Router } from "./Router"

import PageHello from "./hello"
import PageWorld from "./world"

export default function App() {
	return (
		<Router>
			
			<Route page="/hello">
				<Wrapper>
					<PageHello />
				</Wrapper>
			</Route>

			<Route page="/world">
				<Wrapper>
					<PageWorld />
				</Wrapper>
			</Route>

		</Router>
	)
}

ReactDOM.render(
	<App />,
	document.getElementById("root"),
)
