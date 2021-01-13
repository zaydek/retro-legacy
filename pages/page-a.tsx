// export async function load() {
// 	const p = new Promise(resolve => {
// 		setTimeout(() => {
// 			resolve({ data: "Hello, world! (home-2)" })
// 		}, 1e3)
// 	})
// 	return p
// }
//
// export function head() {
// 	return <title>Hello, world! (home-2)</title>
// }
//
// interface HomeProps {
// 	data: string
// }

// export default function Home({ data }: HomeProps) {

import React from "react"
import { Link } from "../Router"

export default function PageA() {
	return (
		<div>
			<h1>Hello, world! (/page-a)</h1>
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
