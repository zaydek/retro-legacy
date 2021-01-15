import React from "react"

// Asynchronously loads props for the page component.
export async function props() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world! /page-b" })
		}, 1e3)
	})
}

// Responsible for rendering `/page-b`.
export default function PageB() {
	return (
		<div>
			<h1>Hello, world! (/page-b)</h1>
		</div>
	)
}
