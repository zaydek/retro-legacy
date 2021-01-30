import React from "react"

interface LoadProps {
	title: string
	description: string
}

type Manifest = Array<{ path: string; props: LoadProps }>

// Synchronously or asynchronously resolves props on the server. Props are
// forwarded as <Head {...props}> and <Page {...props}>.
export async function load(): Promise<LoadProps> {
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
export function manifest(props: LoadProps): Manifest {
	return [
		{ path: "xyz", props },
		{ path: "xyz", props },
		{ path: "xyz", props },
	]
}

// Head resolves page metadata on the server.
export function Head({ title, description }: LoadProps): JSX.Element {
	return (
		<>
			<title>{title}</title>
			<meta name="title" content={title} />
			<meta name="description" content={description} />
		</>
	)
}

export default function Page(props: LoadProps): JSX.Element {
	return (
		<div>
			<h1>Hello world!</h1>
			<pre>{JSON.stringify(props)}</pre>
		</div>
	)
}
