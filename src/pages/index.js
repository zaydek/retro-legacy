import Nav from "./Nav_"

import React, { useState } from "react"

// throw new Error("oops")

export function Head() {
	return <title>Welcome to my wonderful website.</title>
}

export default function Body() {
	const [state, setState] = useState("Hello, world!")

	// React.useLayoutEffect(() => {
	// 	console.log("Hello, world!")
	// }, [])

	return (
		<div>
			<Nav />
			<h1>Hello that cool?</h1>
			<h1 onClick={() => setState("Oops")}>{state}</h1>
		</div>
	)
}
