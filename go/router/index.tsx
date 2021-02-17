import React, { useState, useEffect } from "react"

export function Route({ children }) {
	return children
}

// Converts a pathname (window.history.pathname) to a path.
function cleanPath(pathname: string): string {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	return path
}

// Converts React children to an array.
function childrenToArray(children?: React.ReactNode): React.ReactNode[] {
	const childrenAsArray: React.ReactNode[] = []
	React.Children.forEach(children, each => childrenAsArray.push(each))
	return childrenAsArray
}

// Searches routes for an route matching path.
//
// prettier-ignore
function findRoute(children: undefined | React.ReactNode, path: string): React.ReactNode  {
	const childrenArr = childrenToArray(children)

	const route = childrenArr.find(each => {
		const ok = React.isValidElement(each) &&
			each.type === Route &&
			each.props.path === path
		return ok
	})
	return route
}

// TODO: Add support for key-based rerenders.
export function Router({ children }) {
	const [path, setPath] = useState(() => cleanPath("undefined" ? "/" : window.location.pathname))

	useEffect(() => {
		function handlePopState(e) {
			const path = cleanPath(window.location.pathname)
			setPath(path)
			window.history.pushState({}, "", path)
			window.scrollTo(0, 0) // TODO
		}
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	}, [])

	// TODO: We should be able to cache routes based on the path prop.
	const route = findRoute(children, path)
	if (!route) {
		return <>{findRoute(children, "/404")}</>
	}
	return <>{route}</>
}
