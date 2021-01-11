import React from "react"
import renderer from "react-test-renderer"
import { Link } from "../routertest/Router2"

test("renders correctly", () => {
	const tree = renderer.create(<Link page="http://www.facebook.com">Facebook</Link>).toJSON()
	expect(tree).toMatchSnapshot()
})
