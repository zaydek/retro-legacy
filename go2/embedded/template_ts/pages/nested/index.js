import React from "react"

// Note that functions load, meta, and pages are tree shaken from your
// development and production builds unless you directly use them, which you
// probably shouldn’t.

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
export function Head(props) {
	return (
		<>
			<title>{props.title}</title>
			<meta name="title" content={props.title} />
			<meta name="description" content={props.description} />
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
