import React from "react"

export interface RouteProps {
	path: string
	children?: React.ReactNode
}

export function Route({ children }: RouteProps) {
	return <>{children}</>
}
