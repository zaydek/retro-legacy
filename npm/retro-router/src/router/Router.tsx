import React, { useLayoutEffect, useState } from "react"
import { Route } from "./Route"
import { useHistory } from "./BrowserRouter"

// TODO: Propagating state between history changes (see the state parameter).

// Converts React children to an array.
function childrenToArray(children?: React.ReactNode) {
	const childrenArr: React.ReactNode[] = []

	// Use React.Children.forEach because React.Children.toArray sets keys.
	//
	// https://reactjs.org/docs/react-api.html#reactchildrentoarray
	React.Children.forEach(children, each => childrenArr.push(each))
	return childrenArr
}

// Searches routes for an route matching path.
//
// prettier-ignore
function findRoute(children: undefined | React.ReactNode, path: string) {
	const childrenArr = childrenToArray(children)

	const route = childrenArr.find(each => {
		const ok = React.isValidElement(each) &&
			each.type === Route &&
			each.props.path === path
		return ok
	})
	return route
}

export interface RouterProps {
	children?: React.ReactNode
}

// TODO: Add support for keys so rerenders are forced?
// TODO: Add error for when history === undefined.
export function Router({ children }: RouterProps) {
	const history = useHistory()

	if (!history) {
		throw new Error(
			"retro-router: It looks like you haven’t wrapped your app with <BrowserRouter>. " +
				"<BrowserRouter> creates a new browser history, which retro-router components use.",
		)
	}

	const [path, setPath] = useState(window.location.pathname)

	useLayoutEffect(() => {
		history.listen(e => setPath(e.location.pathname))
	}, [history])

	const route = findRoute(children, path)
	if (!route) {
		return <>{findRoute(children, "/404")}</>
	}
	return <>{route}</>
}
