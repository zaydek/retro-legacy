import React from "react"

// You can optionally export load and meta. Use load to synchronously or
// asynchronously page props on the server. Page props are forwarded to meta and
// your page component.
//
// Note that load and meta are tree shaken from your development and production
// builds unless you directly use load or meta, which you probably shouldn’t.

export function load() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				title: "Nested hello, world!",
				description: "This page was made using Retro.",
			})
		}, 1e3)
	})
}

export function meta(pageProps) {
	return (
		<>
			<title>{pageProps.title}</title>
			<meta name="title" content={pageProps.title} />
			<meta name="description" content={pageProps.description} />
		</>
	)
}

export default function Page(pageProps) {
	return (
		<div>
			<h1>Nested hello world!</h1>
			<pre>{JSON.stringify(pageProps)}</pre>
		</div>
	)
}
