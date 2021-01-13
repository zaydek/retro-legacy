import React from "react"

export interface RouteProps {
	page: string
	children?: React.ReactNode
}

export function Route({ children }: RouteProps) {
	return <>{children}</>
}
