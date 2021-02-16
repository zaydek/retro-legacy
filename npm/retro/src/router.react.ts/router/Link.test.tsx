import React from "react"
import renderer from "react-test-renderer"
import { Link } from "./Link"

test("should render an anchor element with an onClick handler", () => {
	const tree = renderer.create(<Link path="https://google.com">Google</Link>).toJSON()
	expect(tree).toMatchInlineSnapshot(`
		<a
		  href="https://google.com"
		  onClick={[Function]}
		>
		  Google
		</a>
	`)
})
