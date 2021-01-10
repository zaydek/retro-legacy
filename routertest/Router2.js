import React, { useEffect, useState } from "react"
import { createBrowserHistory } from "history"

const history = createBrowserHistory()

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

export function Router({ children }) {
	const [url, setURL] = useState(window.location.pathname)

	// Triggers a rerender.
	useEffect(() => {
		const unlisten = history.listen(e => {
			if (e.location.pathname === url) {
				// No-op
				return
			}
			setURL(e.location.pathname)
		})
		return unlisten
	})

	// prettier-ignore
	const found = children.find(each => {
    const ok = (
      each.type === Route &&
      each.props.href === url
    )
    return ok
  })

	if (!found) {
		return <Redirect href="/404" />
	}
	return found
}
