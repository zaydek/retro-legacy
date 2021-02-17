import React, { useEffect } from "react"
import Component from "./Component"

// resolveServerProps resolves props on the server. Props are cached for retro
// dev --cached and retro export --cached. Props are then forwarded as
// resolveServerPaths(serverProps), <Head {...serverProps}>, and
// <Page {...serverProps}>.
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
// are forwarded as <Head {...serverProps}> and <Page {...serverProps}>.
//
// prettier-ignore
export async function resolveServerPaths(serverProps) {
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

export default function Page({ name, ...props }) {
	useEffect(() => {
		console.log(`Hello, world! you are rendering the ${name} page!`)
	}, [name])

	return (
		<div>
			<h1>Hello, {name}!</h1>
			<pre>{JSON.stringify(props, null, 2)}</pre>
			<Component />
		</div>
	)
}
