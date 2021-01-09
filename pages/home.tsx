import React, { useEffect } from "react"

export async function load() {
	const p = new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world!" })
		}, 1e3)
	})
	return p
}

export function head() {
	return <title>Hello, world! (page A)</title>
}

interface HomeProps {
	data: string
}

// prettier-ignore
export default function Home({ data }: HomeProps) {
	useEffect(() => {
		console.log("Hello, world!")
	}, [])

	return  (
		<div>
			<h1>
				Hello, world!
			</h1>
			<a href="home-2">go to other page</a>
			<pre>
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	)
}
