import React from "react"
import { Route, Router } from "../routertest/Router"

beforeAll(() => {
	mock_location_pathname()
})

test("should route to /404", () => {
	const snapshot = renderSnapshot(
		"/oops",
		<Router>
			<Route page="/404">
				<h1>
					Hello, <code>/404</code>!
				</h1>
			</Route>
		</Router>,
	)
	expect(snapshot).toMatchInlineSnapshot(`
    <h1>
      Hello,\u0020
      <code>
        /404
      </code>
      !
    </h1>
  `)
})

test("should route to null; there is no /404 route", () => {
	const snapshot = renderSnapshot("/oops", <Router>{/* Nothing to see here. */}</Router>)
	expect(snapshot).toMatchInlineSnapshot("null")
})
