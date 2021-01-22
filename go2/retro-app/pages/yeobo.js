import React from "react"

// Head resolves page metadata on the server.
export function Head() {
	return <title>Yubins Page</title>
}

export default function PageComponent(props) {
	return (
		<div>
			<h1>Hello Yubin!</h1>
		</div>
	)
}
