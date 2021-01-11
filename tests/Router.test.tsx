import React from "react"
import renderer from "react-test-renderer"
import { Route, Router } from "../routertest/Router"

// Mocks `window.loation.pathname`.
//
// https://stackoverflow.com/a/54034379
Object.defineProperty(window, "location", {
	value: { pathname: "/" },
	writable: true,
})

function Routes() {
	return (
		<Router>
			<Route page="/">
				<code>/</code>
			</Route>
			<Route page="/page-a">
				<code>/page-a</code>
			</Route>
			<Route page="/page-b">
				<code>/page-b</code>
			</Route>
		</Router>
	)
}

test("should route to /", () => {
	window.location.pathname = "/"
	const tree = renderer.create(<Routes />).toJSON()
	expect(tree).toMatchInlineSnapshot(`
		<code>
		  /
		</code>
	`)
})

test("should route to /page-a", () => {
	window.location.pathname = "/page-a"
	const tree = renderer.create(<Routes />).toJSON()
	expect(tree).toMatchInlineSnapshot(`
		<code>
		  /page-a
		</code>
	`)
})

test("should route to /page-b", () => {
	window.location.pathname = "/page-b"
	const tree = renderer.create(<Routes />).toJSON()
	expect(tree).toMatchInlineSnapshot(`
		<code>
		  /page-b
		</code>
	`)
})
