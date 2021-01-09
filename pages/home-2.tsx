import React, { useEffect } from "react"

export async function load() {
	const p = new Promise(resolve => {
		setTimeout(() => {
			resolve("Hello, world! (home-2)")
		}, 1e3)
	})
	return p
}

export function head() {
	return <title>Hello, world! (home-2)</title>
}

interface HomeProps {
	data: string
}

// prettier-ignore
export default function Home({ data }: HomeProps) {
	useEffect(() => {
		console.log("Hello, world! (home-2)")
	}, [])

	return  (
		<div>
			<h1>
				Hello, world! (home-2)
			</h1>
			<a href="home">go to other page</a>
			<pre>
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	)
}
