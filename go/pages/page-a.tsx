import React from "react"

export function head() {
	return <title>Hello, world!</title>
}

// Asynchronously loads props for the page component.
export async function props() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world! /page-a" })
		}, 1e3)
	})
}

// Responsible for rendering `/page-a`.
export default function PageA() {
	return (
		<div>
			<h1>Hello, world! (/page-a)</h1>
		</div>
	)
}
