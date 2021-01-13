import React from "react"
import { Link } from "../Router"

export async function load() {
	const p = new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world! /page-b" })
		}, 1e3)
	})
	return p
}

export function head() {
	return <title>Hello, world! (/page-b)</title>
}

interface PageProps {
	data: string
}

export default function PageB(_: PageProps) {
	return (
		<div>
			<h1>Hello, world! (/page-b)</h1>
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
