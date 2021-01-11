import React, { Fragment, useLayoutEffect, useState } from "react"
import { history } from "./history"
import { Route } from "./Route"

// TODO: Missing support for parsed params, scroll restoration (is this not
// automatic?), scroll callbacks or equivalent, propagating state between
// history changes (see the state parameter). Also, possibly direct access to
// the history value? Maybe a hook or something else.

// Creates a four-character hash.
function newHash() {
	return Math.random().toString(16).slice(2, 6)
}

// Converts React children to an array.
function childrenToArray(children?: React.ReactNode) {
	const childrenArr: React.ReactNode[] = []

	// Use `React.Children.forEach` because `React.Children.toArray` sets keys.
	//
	// https://reactjs.org/docs/react-api.html#reactchildrentoarray
	React.Children.forEach(children, each => childrenArr.push(each))
	return childrenArr
}

// Searches routes for an route matching `page`.
//
// prettier-ignore
function findRoute(children: undefined | React.ReactNode, page: string) {
	const childrenArr = childrenToArray(children)

	const route = childrenArr.find(each => {
		const ok = React.isValidElement(each) &&
			each.type === Route &&
			each.props.page === page
		return ok
	})
	return route
}

export interface RouterProps {
	children?: React.ReactNode
}

export function Router({ children }: RouterProps) {
	// prettier-ignore
	const [state, setState] = useState({
		hash: newHash(),                // A four-character hash to force rerender the same route
		page: window.location.pathname, // The current pathname, per render
	})

	// TODO: Change to `useEffect`?
	useLayoutEffect(() => {
		const defer = history.listen(e => {
			if (e.location.pathname === state.page) {
				setState({ ...state, hash: newHash() })
				return
			}
			setState({ hash: newHash(), page: e.location.pathname })
		})
		return defer
	})

	const route = findRoute(children, state.page)
	if (!route) {
		return <>{findRoute(children, "/404")}</>
	}
	return <Fragment key={state.hash}>{route}</Fragment>
}
