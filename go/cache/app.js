// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// App
import App from "../pages/internal/app"

// Pages
import TODO from "page-a"
import TODO from "page-b"

// Page props
import pageProps from "../cache/pageProps"

export default function RoutedApp() {
	return (
		<Router>
		
			<Route page="/page-a">
				<TODO {...pageProps["page-a"]} />
			</Route>
		
			<Route page="/page-b">
				<TODO {...pageProps["page-b"]} />
			</Route>
		
		</Router>
	)
}

ReactDOM.hydrate(
	<RoutedApp />,
	document.getElementById("root"),
)
