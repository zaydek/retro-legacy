import React from "react"

interface PageAProps {
	a: string
	b: string
}

export default function PageA({ a, b }: PageAProps) {
	return (
		<div>
			<h1>
				Hello, world! a={a} b={b}
			</h1>
		</div>
	)
}
