import React, { Fragment, useEffect, useLayoutEffect, useState } from "react"
import { createBrowserHistory } from "history"

export const history = createBrowserHistory()

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

export function Router({ children }) {
	// prettier-ignore
	const [urlState, setURLState] = useState({
		key: newHash(),                // A four-character hash to force rerender routes
		url: window.location.pathname, // The current pathname, per render
	})

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

	let foundElement = null
	React.Children.forEach(children, each => {
		// prettier-ignore
		const ok = (
			React.isValidElement(each) &&
			each.type === Route &&
			each.props.href === urlState.url
		)
		if (!ok) {
			// No-op
			return
		}
		foundElement = each
	})

	if (!foundElement) {
		return <Redirect href="/404" />
	}

	// Use `key={...}` to force rerender the same route.
	return <Fragment key={urlState.key}>{foundElement}</Fragment>
}
