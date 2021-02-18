import React, { useEffect, useState, useMemo } from "react"
import { createStore, useStore, useStoreSetState } from "../store"

interface LinkProps {
	path: string
	children?: React.ReactNode
}

const pathStore = createStore(getPath())

export function Link({ path, children, ...props }: LinkProps) {
	const setPath = useStoreSetState(pathStore)

	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		setPath(path)
		window.scrollTo(0, 0) // TODO
	}

	const scoped = !/^https?:\/\//.test(path)
	return (
		// prettier-ignore
		<a href={path} target={scoped ? undefined : "_blank"} rel={scoped ? undefined : "noreferrer noopener"}
				onClick={scoped ? handleClick : undefined} {...props}>
			{children}
		</a>
	)
}

interface RouteProps {
	path: string
	children?: React.ReactNode
}

export function Route({ children }: RouteProps) {
	return children
}

// Converts a pathname (window.history.pathname) to a path.
function convertPath(pathname: string): string {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	return path
}

function getPath() {
	const pathname = typeof window === "undefined" ? "/" : window.location.pathname
	return convertPath(pathname)
}

// TODO: Add support for key-based rerenders.
export function Router({ children }) {
	const [path, setPath] = useStore(pathStore)

	useEffect(() => {
		function handlePopState(_: PopStateEvent) {
			const path = getPath()
			setPath(path)
			window.history.pushState({}, "", path)
			window.scrollTo(0, 0) // TODO
		}
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	}, [])

	const cachedRouteMap = useMemo(() => {
		const routeMap = {}
		React.Children.forEach(children, child => {
			if (!React.isValidElement(child)) return

			if (child !== undefined && child.props !== undefined && (child.props as RouteProps).path !== "") {
				routeMap[(child.props as RouteProps).path] = child
			}
		})
		return routeMap
	}, [children])

	const route = cachedRouteMap[path] || cachedRouteMap["/404"]
	return <>{route}</>
}
