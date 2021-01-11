import React from "react"
import renderer from "react-test-renderer"
import { Route, Router } from "../router/Router"

beforeAll(() => {
	mock_location_pathname()
})

test("should route to /404", () => {
	window.location.pathname = "/oops"
	const tree = renderer.create(
		<Router>
			<Route page="/404">
				<h1>
					Hello, <code>/404</code>!
				</h1>
			</Route>
		</Router>,
	)
	expect(tree).toMatchInlineSnapshot(`
    <h1>
      Hello,\u0020
      <code>
        /404
      </code>
      !
    </h1>
  `)

	// Never changes:
	expect(window.location.pathname).toBe("/oops")
})

test("should route to null; there is no /404 route", () => {
	window.location.pathname = "/oops"
	const tree = renderer.create(<Router>{/* Nothing to see here. */}</Router>)
	expect(tree).toMatchInlineSnapshot("null")

	// Never changes:
	expect(window.location.pathname).toBe("/oops")
})
