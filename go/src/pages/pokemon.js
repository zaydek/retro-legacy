import Component from "./component"
import React, { useEffect } from "react"
import { Link } from "../../router"

// serverProps resolves props on the server. Props are cached for retro
// dev --cached and retro export --cached. Props are then forwarded as
// serverPaths(serverProps), <Head {...serverProps}>, and
// <Page {...serverProps}>.
export async function serverProps() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				title: "Hello, world!",
				description: "This page was made using Retro.",
			})
		}, 1e3)
	})
}

// serverProps resolves paths on the server for dynamic pages. The returned
// array describes { path, props }, where path creates a page and props are
// forwarded as <Head {...serverProps}> and <Page {...serverProps}>.
//
// prettier-ignore
export async function serverPaths(serverProps) {
	return [
		{ path: "/bulbasaur",  props: { ...serverProps, name: "Bulbasaur",  type: "🌱" } },
		{ path: "/charmander", props: { ...serverProps, name: "Charmander", type: "🔥" } },
		{ path: "/pikachu",    props: { ...serverProps, name: "Pikachu",    type: "⚡️" } },
		{ path: "/squirtle",   props: { ...serverProps, name: "Squirtle",   type: "💧" } },
	]
}

export function Head({ type, name }) {
	return (
		<>
			<title>Hello, {name}!</title>
			<meta type="title" value={`Hello, ${name}!`} />
			<meta type="description" value={`This is a page about ${name} -- a ${type} type Pokémon!`} />
		</>
	)
}

function Nav() {
	return (
		// prettier-ignore
		<ul>
			<li><Link path="/bulbasaur">Open bulbasaur</Link></li>
			<li><Link path="/charmander">Open charmander</Link></li>
			<li><Link path="/pikachu">Open pikachu</Link></li>
			<li><Link path="/squirtle">Open squirtle</Link></li>
		</ul>
	)
}

export default function Page({ name, ...props }) {
	useEffect(() => {
		console.log(`Hello, world! you are rendering the ${name} page!`)
	}, [name])

	return (
		<div>
			<Nav />
			<h1>Hello, {name}!</h1>
			<pre>{JSON.stringify(props, null, 2)}</pre>
			<Component />
		</div>
	)
}
