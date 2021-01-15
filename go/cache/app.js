// THIS FILE IS AUTO-GENERATED.
// THESE AREN’T THE FILES YOU’RE LOOKING FOR.
// MOVE ALONG.

import React from "react"
import ReactDOM from "react-dom"
import { Route, Router } from "../Router"

// FIXME: We need to check whether the user has a component here. As a temporary
// fix, we can os.Stat and check whether a file exists. We don’t need to check
// that the file does what it’s supposed to do for now.
// App
import App from "../pages/internal/app"

// Pages
import TODO from "page-a"
import TODO from "page-b"

// FIXME: We need to check whether the user has a component here. As a temporary
// fix, we can os.Stat and check whether a file exists. We don’t need to check
// that the file does what it’s supposed to do for now.
// Page props
// TODO: Add support for 'appProps'
import pageProps from "./pageProps"

export default function RoutedApp() {
	return (
		<Router>
		
			<Route page="page-a">
				<TODO {...pageProps["page-a"]} />
			</Route>
		
			<Route page="page-b">
				<TODO {...pageProps["page-b"]} />
			</Route>
		
		</Router>
	)
}

ReactDOM.hydrate(
	<RoutedApp />,
	document.getElementById("root"),
)
