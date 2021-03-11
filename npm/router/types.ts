import React from "react"

export type ScrollTo = number | [number, number] | "no-op"

export interface LinkProps {
	path: string
	scrollTo?: number | [number, number] | "no-op"
	children: React.ReactNode
}

export interface RouteProps {
	path: string
	children: React.ReactNode
}

export interface RouterProps {
	path: string
	children: React.ReactNode
}

export type Link = ({ path, scrollTo, children, ...props }: LinkProps) => JSX.Element
export type Route = ({ children }: RouteProps) => JSX.Element
export type Router = ({ children }: RouterProps) => JSX.Element
