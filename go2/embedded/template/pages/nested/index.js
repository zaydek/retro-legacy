import React from "react"

// This is a nested page and will appear at domain.ext/nested.
//
// You can use the load function to synchronously or asynchronously load data.
// Loaded data is forwarded to meta and the Page component. This means you can
// dynamically generate head and page props on the server.
//
// Because of tree shaking, load and head are automatically from your production
// build unless you use load or head.

export async function load() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				title: "Nested hello, world!",
				description: "This page was made using Retro.",
			})
		}, 1e3)
	})
}

export function head(loadProps) {
	return (
		<>
			<title>{loadProps.title}</title>
			<meta name="title" content={loadProps.title} />
			<meta name="description" content={loadProps.description} />
		</>
	)
}

export default function Page(loadProps) {
	return (
		<div>
			<h1>Nested hello world!</h1>
			<pre>{JSON.stringify(loadProps)}</pre>
		</div>
	)
}
