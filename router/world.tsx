import React from "react"
import { Link } from "./Router"

export default function World() {
	return (
		<div>
			<h1>Hello, world! (/world)</h1>
			<Link page="/">
				<p>Go to page /</p>
			</Link>
			<Link page="/hello">
				<p>Go to page /hello</p>
			</Link>
			<Link page="/world">
				<p>Go to page /world</p>
			</Link>
		</div>
	)
}
