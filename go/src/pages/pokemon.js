import React, { useEffect } from "react"
import Component from "./Component"

// resolveServerProps resolves props on the server. Props are cached for retro
// dev --cached and retro export --cached. Props are then forwarded as
// resolveServerPaths(srvProps), <Head {...srvProps}>, and <Page {...srvProps}>.
export async function resolveServerProps() {
	return new Promise(resolve => {
		setTimeout(() => {
			resolve({
				title: "Hello, world!",
				description: "This page was made using Retro.",
			})
		}, 1e3)
	})
}

// resolveServerProps resolves paths on the server for dynamic pages. The
// returned array describes { path, props }, where path creates a page and props
// are forwarded as <Head {...srvProps}> and <Page {...srvProps}>.
//
// prettier-ignore
export async function resolveServerPaths(srvProps) {
	return [
		{ path: "/bulbasaur",  props: { ...srvProps, name: "Bulbasaur",  type: "🌱" } },
		{ path: "/charmander", props: { ...srvProps, name: "Charmander", type: "🔥" } },
		{ path: "/pikachu",    props: { ...srvProps, name: "Pikachu",    type: "⚡️" } },
		{ path: "/squirtle",   props: { ...srvProps, name: "Squirtle",   type: "💧" } },
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

export default function Page({ name, ...props }) {
	useEffect(() => {
		console.log("Hello, world!")
	}, [])

	return (
		<div>
			<h1>Hello, {name}!</h1>
			<pre>{JSON.stringify(props, null, 2)}</pre>
			<Component />
		</div>
	)
}
