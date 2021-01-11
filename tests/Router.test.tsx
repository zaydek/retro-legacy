import React from "react"
import renderer from "react-test-renderer"
import { Link } from "../routertest/Router"

// interface LinkProps extends React.HTMLAttributes<HTMLElement> {
// 	href: string
// }

// function Link(props: LinkProps) {
// 	return <a {...props} />
// }

test("renders correctly", () => {
	const tree = renderer.create(<Link page="https://google.com">Google</Link>).toJSON()
	expect(tree).toMatchInlineSnapshot(`
		<a
		  href="https://google.com"
		  onClick={[Function]}
		>
		  Google
		</a>
	`)
})
