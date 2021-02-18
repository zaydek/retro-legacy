import Nav from "./Nav_"
import React from "react"

export function Head() {
	return <title>Welcome to my wonderful website.</title>
}

export default function Page() {
	return (
		<div>
			<Nav />
			<h1>My website</h1>
		</div>
	)
}
