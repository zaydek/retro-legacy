import React, { Fragment, useEffect, useState } from "react"
import { createBrowserHistory } from "history"

export const history = createBrowserHistory()

// TODO: Add support for `history.push` or `history.replace`.
export function Link({ href, children, ...props }) {
	function handleClick(e) {
		e.preventDefault()
		console.log(`clicked href=${href}`)
		history.push(href)
	}
	return (
		<a href={href} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}

// TODO: Add support for `history.push` or `history.replace`.
function Redirect({ href }) {
	// TODO: Change to `useLayoutEffect`?
	useEffect(() => {
		history.replace(href)
	}, [])
	return null
}

export function Route({ href, children }) {
	return children
}

// Routers are so simple it’s laughable. At least this one is. We model the DOM
// URL as a virtual URL which allows us to control how and when to rerender
// children, e.g. our app.
//
// When bind a listener to `history.listen` which triggers our URL to rerender
// when the polyfilled history API catches synthetic `popState` or `pushState`
// events, which can be triggered from `<Anchor>` clicks or the back and forward
// buttons.
//
// Then we query children for a matching pathname and selectively rerender.
//
export function Router({ children }) {
	const [urlState, setURLState] = useState({
		key: Math.random(),
		url: window.location.pathname,
	})

	useEffect(() => {
		const unlisten = history.listen(e => {
			if (e.location.pathname === urlState.url) {
				setURLState({ ...urlState, key: Math.random() })
				return
			}
			setURLState({ key: Math.random(), url: e.location.pathname })
		})
		return unlisten
	})

	// prettier-ignore
	const found = children.find(each => {
    const ok = (
      each.type === Route &&
      each.props.href === urlState.url
    )
    return ok
  })

	if (!found) {
		return <Redirect href="/404" />
	}

	return <Fragment key={urlState.key}>{found}</Fragment>
}
