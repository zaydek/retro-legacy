import React from "react"

interface WrapperProps {
	children?: React.ReactNode
}

export default function Wrapper({ children }: WrapperProps) {
	return (
		<div>
			<h1>Welcome to my website</h1>
			{children}
		</div>
	)
}
