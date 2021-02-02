import React from "react"
import renderer from "react-test-renderer"
import { BrowserRouter } from "./BrowserRouter"
import { Route } from "./Route"
import { Router } from "./Router"

beforeAll(() => {
	mockLocationPathname()
})

test("should route to /404", () => {
	window.location.pathname = "/oops"
	const tree = renderer.create(
		<BrowserRouter>
			<Router>
				<Route path="/404">
					<h1>
						Hello, <code>/404</code>!
					</h1>
				</Route>
			</Router>
		</BrowserRouter>,
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
	const tree = renderer.create(
		// prettier-ignore
		<BrowserRouter>
			<Router>
				{/* Nothing to see here. */}
			</Router>
		</BrowserRouter>,
	)
	expect(tree).toMatchInlineSnapshot("null")

	// Never changes:
	expect(window.location.pathname).toBe("/oops")
})
