import * as types from "./types"
import React from "react"
import { scrollToImpl } from "./scrollToImpl"
import { useHistory } from "./BrowserRouter"

export const Link: typeof types.Link = ({ path, shouldReplaceHistory, scrollTo, children, ...props }) => {
	const history = useHistory()!

	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		const fn = shouldReplaceHistory ? history.replace : history.push
		fn(path)

		// TODO: We need to check whether scrollToImpl is evaluated eagerly or
		// lazily; before or after <Router> rerenders.
		scrollToImpl(scrollTo)
	}

	return (
		<a href={path} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}
