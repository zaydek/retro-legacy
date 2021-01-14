import React from "react"

// Asynchronously loads props for the page component.
export async function props() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world! /page-a" })
		}, 1e3)
	})
}

export default function PageA() {
	return (
		<div>
			<h1>Hello, world! (/page-a)</h1>
		</div>
	)
}
