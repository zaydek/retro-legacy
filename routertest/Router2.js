import React, { Fragment, useEffect, useState } from "react"
import { createBrowserHistory } from "history"

export const history = createBrowserHistory()

// TODO: Missing support for parsed params, scroll restoration, scroll callbacks
// or equivalent, propagating state between history changes. Also, possibly
// direct access to the history value.

/*
 * Anchor
 */

export function Anchor({ href, children, shouldReplaceHistory, ...props }) {
	function handleClick(e) {
		e.preventDefault()
		const fn = shouldReplaceHistory ? history.replace : history.push
		fn(href)
	}
	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

/*
 * Redirect
 */

export function Redirect({ href, shouldReplaceHistory }) {
	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(href)
	return null
}

/*
 * Route
 */

export function Route({ href, children }) {
	return children
}

// Creates a four-character hash.
function newHash() {
	return Math.random().toString(16).slice(2, 6)
}

/*
 * Router
 */

// Converts React children to an array.
function childrenToArray(children) {
	const els = []

	// Use `React.Children.forEach` because `React.Children.toArray` sets keys.
	//
	// https://reactjs.org/docs/react-api.html#reactchildrentoarray
	React.Children.forEach(children, each => els.push(each))
	return els
}

// Searches routes for an route matching `href`.
function searchHref(els, href) {
	// prettier-ignore
	const found = els.find(each => {
		const ok = React.isValidElement(each) &&
			each.type === Route &&
			each.props.href === href
		return ok
	})
	return found
}

// TODO: Test empty routes e.g. `<Route href="/404"></Route>`.
export function Router({ children }) {
	// prettier-ignore
	const [urlState, setURLState] = useState({
		key: newHash(),                // A four-character hash to force rerender routes
		url: window.location.pathname, // The current pathname, per render
	})

	useEffect(() => {
		const els = childrenToArray(routes)
		if (!els.every(each => React.isValidElement(each) && each.type === Router)) {
			console.warn(
				"Router: " +
					"`<Router>` children must be React elements of type `<Route>`; " +
					'Use `<Route href="...">...</Route>` to suppress this warning.',
			)
		}
		if (!searchHref(els, "/404")) {
			console.warn(
				"Router: " +
					"No such `/404` route. " +
					'`<Router>` uses `<Redirect href="/404">` internally when no routes are matched. ' +
					'Add `<Route href="/404">...</Route>` to suppress this warning.',
			)
		}
	}, [])

	useEffect(() => {
		const unlisten = history.listen(e => {
			if (e.location.pathname === urlState.url) {
				setURLState({
					...urlState,
					key: newHash(),
				})
				return
			}
			setURLState({
				key: Math.random(),
				url: e.location.pathname,
			})
		})
		return unlisten
	})

	const route = searchHref(children, urlState.url)
	if (!route) {
		return <Redirect href="/404" />
	}
	// Use `key={...}` to force rerender the same route.
	return <Fragment key={urlState.key}>{route}</Fragment>
}
