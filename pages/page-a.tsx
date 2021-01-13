import React from "react"
import { Link } from "../Router"

export async function load() {
	const p = new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world! /page-a" })
		}, 1e3)
	})
	return p
}

export function head() {
	return <title>Hello, world! (/page-a)</title>
}

interface PageProps {
	data: string
}

export default function PageA(_: PageProps) {
	return (
		<div>
			<h1>Hello, world! (/page-a)</h1>
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
