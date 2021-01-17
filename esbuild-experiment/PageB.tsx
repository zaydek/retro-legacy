import React from "react"

interface PageBProps {
	a: string
	b: string
}

export default function PageB({ a, b }: PageBProps) {
	return (
		<div>
			<h1>
				Hello, world! a={a} b={b}
			</h1>
		</div>
	)
}
