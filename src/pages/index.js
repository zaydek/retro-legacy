// import Nav from "./Nav_"

import React, { useState } from "react"

export function Head() {
	return <title>Welcome to my wonderful website.</title>
}

export default function Page() {
	const [state, setState] = useState("Hello, world!")
	return (
		<div>
			<h1 onClick={() => setState("Oops")}>{state}</h1>
		</div>
	)
}
