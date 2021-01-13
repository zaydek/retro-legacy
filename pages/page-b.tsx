import React from "react"
import { Link } from "../Router"

export default function PageB() {
	return (
		<div>
			<h1>Hello, world! (/page-b)</h1>
			{/* TODO */}
			<Link page="/">
				<p>Go to page /</p>
			</Link>
			<Link page="/page-a">
				<p>Go to page /page-a</p>
			</Link>
			<Link page="/page-b">
				<p>Go to page /page-b</p>
			</Link>
		</div>
	)
}
