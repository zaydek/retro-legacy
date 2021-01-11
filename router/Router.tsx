import React, { Fragment, useLayoutEffect, useState } from "react"
import { createBrowserHistory } from "history"

export const history = createBrowserHistory()

// TODO: Missing support for parsed params, scroll restoration (is this not
// automatic?), scroll callbacks or equivalent, propagating state between
// history changes (see the state parameter). Also, possibly direct access to
// the history value? Maybe a hook or something else.

// Creates a four-character hash.
function newHash() {
	return Math.random().toString(16).slice(2, 6)
}

/*
 * <Link>
 */

type ScrollTo = "no-op" | number | string | HTMLElement

// TODO: Is `React.HTMLAttributes<HTMLElement>` right?
export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
	page: string
	children?: React.ReactNode
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
}

// Implementation for scrolling behavior for `<Link>`.
function scrollToImpl(scrollTo?: ScrollTo) {
	let el = null
	switch (typeof scrollTo) {
		case "undefined":
			// Scroll to the top of the page (reset):
			window.scrollTo(0, 0)
			break
		case "number":
			// Scroll to the number:
			window.scrollTo(0, scrollTo)
			break
		case "string":
			// Constant "no-op" case:
			if (scrollTo === "no-op") {
				// No-op
				return
			}
			// Scroll to the selector:
			//
			// TODO: Add support for `scroll-padding-top`?
			el = document.querySelector(scrollTo)
			if (!el) {
				console.error(`Link: Selector \`scrollTo\` returned \`${el}\`; scrollTo=${scrollTo}.`)
			} else {
				window.scrollTo(0, el.getBoundingClientRect().y)
			}
			break
		default:
			break
	}
}

export function Link({ page, children, shouldReplaceHistory, scrollTo, ...props }: LinkProps) {
	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		const fn = shouldReplaceHistory ? history.replace : history.push
		fn(page)
		scrollToImpl(scrollTo)
	}
	return (
		<a href={page} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

/*
 * <Redirect>
 */

export interface RedirectProps {
	page: string
	shouldReplaceHistory?: boolean
}

export function Redirect({ page, shouldReplaceHistory }: RedirectProps) {
	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(page)
	return null
}

/*
 * <Route>
 */

export interface RouteProps {
	page: string
	children?: React.ReactNode
}

export function Route({ children }: RouteProps) {
	return <>{children}</>
}

/*
 * <Router>
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
