import React, { Fragment, useEffect, useState } from "react"
import { createBrowserHistory } from "history"

export const history = createBrowserHistory()

// TODO: Missing support for parsed params, scroll restoration, scroll callbacks
// or equivalent, propagating state between history changes. Also, possibly
// direct access to the history value.

// Creates a four-character hash.
function newHash() {
	return Math.random().toString(16).slice(2, 6)
}

/*
 * Anchor
 */

// TODO: Is `React.HTMLAttributes<HTMLElement>` right here?
interface AnchorProps extends React.HTMLAttributes<HTMLElement> {
	href: string
	children?: React.ReactNode
	shouldReplaceHistory?: boolean
}

export function Anchor({ href, children, shouldReplaceHistory, ...props }: AnchorProps) {
	function handleClick(e: React.MouseEvent) {
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

interface RedirectProps {
	href: string
	shouldReplaceHistory?: boolean
}

export function Redirect({ href, shouldReplaceHistory }: RedirectProps) {
	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(href)
	return null
}

/*
 * Route
 */

interface RouteProps {
	href: string
	children?: React.ReactNode
}

export function Route({ children }: RouteProps) {
	return <>{children}</>
}

/*
 * Router
 */

// Converts React children to an array.
function childrenToArray(children?: React.ReactNode) {
	const childrenArr: React.ReactNode[] = []

	// Use `React.Children.forEach` because `React.Children.toArray` sets keys.
	//
	// https://reactjs.org/docs/react-api.html#reactchildrentoarray
	React.Children.forEach(children, each => childrenArr.push(each))
	return childrenArr
}

// Searches routes for an route matching `href`.
//
// prettier-ignore
function findRouteWithHref(childrenArr: React.ReactNode[], href: string) {
	const route = childrenArr.find(each => {
		const ok = React.isValidElement(each) &&
			each.type === Route &&
			each.props.href === href
		return ok
	})
	return route
}

// TODO: Constrain `children` to `Route[]`?
interface RouterProps {
	children?: React.ReactNode
}

// TODO: Test empty routes e.g. `<Route href="/404"></Route>`.
export function Router({ children }: RouterProps) {
	// prettier-ignore
	const [urlState, setURLState] = useState({
		key: newHash(),                // A four-character hash to force rerender routes
		url: window.location.pathname, // The current pathname, per render
	})

	// // TODO: Constrain `children` to `Route[]`?
	// useEffect(() => {
	// 	const childrenArr = childrenToArray(children)
	// 	const childrenAreOnlyRoutes = !childrenArr.every(each => React.isValidElement(each) && each.type === Router)
	// 	if (childrenAreOnlyRoutes) {
	// 		console.warn(
	// 			"Router: " +
	// 				"`<Router>` children must be React elements of type `<Route>`; " +
	// 				'Use `<Route href="...">...</Route>` to suppress this warning.',
	// 		)
	// 	}
	// 	const route404 = !findRouteWithHref(childrenArr, "/404")
	// 	if (!route404) {
	// 		console.warn(
	// 			"Router: " +
	// 				"No such `/404` route. " +
	// 				'`<Router>` uses `<Redirect href="/404">` internally when no routes are matched. ' +
	// 				'Add `<Route href="/404">...</Route>` to suppress this warning.',
	// 		)
	// 	}
	// }, [])

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
				key: newHash(),
				url: e.location.pathname,
			})
		})
		return unlisten
	})

	// TODO: Do we want to convert to an array on every render?
	const childrenArr = childrenToArray(children)
	const route = findRouteWithHref(childrenArr, urlState.url)
	if (!route) {
		return <Redirect href="/404" />
	}

	// Use `key={...}` to force rerender the same route.
	return <Fragment key={urlState.key}>{route}</Fragment>
}
