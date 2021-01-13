import React from "react"

interface AppProps {
	children?: React.ReactNode
}

export default function MDX({ children }: AppProps) {
	return (
		<div>
			<h1>Welcome to my website</h1>
			{children}
		</div>
	)
}
