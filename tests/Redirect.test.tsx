import React from "react"
import renderer from "react-test-renderer"
import { Route, Router } from "../routertest/Router"

// https://stackoverflow.com/a/54034379
function mock_location_pathname() {
	Object.defineProperty(window, "location", {
		value: { pathname: "/" },
		writable: true,
	})
}

beforeAll(() => {
	mock_location_pathname()
})

test("should route to /404", () => {
	window.location.pathname = "/oops"
	const tree = renderer
		.create(
			<Router>
				<Route page="/404">
					<h1>
						Hello, <code>/404</code>!
					</h1>
				</Route>
			</Router>,
		)
		.toJSON()
	expect(tree).toMatchInlineSnapshot(`
    <h1>
      Hello,\u0020
      <code>
        /404
      </code>
      !
    </h1>
  `)
})

test("should route to null", () => {
	window.location.pathname = "/oops"
	const tree = renderer.create(<Router>{/* Nothing to see here. */}</Router>).toJSON()
	expect(tree).toMatchInlineSnapshot("null")
})
