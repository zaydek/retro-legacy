import React from "react"

// Synchronously or asynchronously resolves props on the server. Props are
// forwarded as <Head {...props}> and <Page {...props}>.
export async function load() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				title: "Hello, world!",
				description: "This page was made using Retro.",
			})
		}, 1e3)
	})
}

// For pages that use [manifest] syntax. Use { path: "..." } for the page URL.
// { props: ... } are forwarded as <Head {...props}> and <Page {...props}>.
export function manifest(props) {
	return [
		{ path: "xyz", props },
		{ path: "xyz", props },
		{ path: "xyz", props },
	]
}

// Head resolves page metadata on the server.
export function Head({ title, description }) {
	return (
		<>
			<title>{title}</title>
			<meta name="title" content={title} />
			<meta name="description" content={description} />
		</>
	)
}

export default function Page(props) {
	return (
		<div>
			<h1>Hello world!</h1>
			<pre>{JSON.stringify(props)}</pre>
		</div>
	)
}
