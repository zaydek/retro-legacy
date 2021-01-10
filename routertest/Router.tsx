import React, { useEffect } from "react"
// import { createBrowserHistory } from "history"

// const history = createBrowserHistory()

// TODO -- duh!
type TODO = any

/*
 * Anchor
 */

// prettier-ignore
interface AnchorProps {
	href:      string // TODO: Change to qualified path name (use TypeScript)?
	children?: React.ReactNode
}

function historyPush(path) {
	history.pushState({}, "", path)
}

// function historyReplace(path) {
//   history.replaceState({}, "", path)
// }

// Ex:
//
// <Anchor href="/page-a" /> -> /page-a
// <Anchor href="/page-b" /> -> /page-b
//
export function Anchor({ href, children, ...props }: AnchorProps) {
	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		historyPush(href)
	}

	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

/*
 * Route
 */

interface RouteProps {
	path: string
	children?: React.ReactNode
}

export function Route({ path, children }: RouteProps) {
	// useEffect(() => {
	//   window.addEventListener("popstate", this.handlePop)
	// 	return () => {
	//   	window.removeEventListener("popstate", this.handlePop)
	// 	}
	// }, [])

	return <>{children}</>
}

/*
 * Router
 */

interface RouterProps {
	children: React.ReactElement | React.ReactElement[]
}

// interface RouterSetState {
// 	url: string
// }

export function Router({ children }: RouterProps) {
	// const [routerState, setRouterState] = React.useState<{ url: string }>(() => ({
	// 	url: window.location.pathname,
	// }))
	//
	// React.useEffect(() => {
	// 	history.listen((e: TODO) => {
	// 		if (e.pathname === routerState.url) {
	// 			// No-op
	// 			return
	// 		}
	// 		setRouterState({ url: e.pathname })
	// 	})
	// 	// TODO: Add deferrer?
	// }, [])
	//
	// if (Array.isArray(children)) {
	// 	return <>{children.find(each => each.props.path === routerState.url)}</>
	// }
	// return <>{children}</>

	return <>{children}</>
}
