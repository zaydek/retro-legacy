import React from "react"
import { ScrollTo, scrollToImpl } from "./scrollToImpl"
import { useHistory } from "./BrowserRouter"

export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
	path: string
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
	children?: React.ReactNode
}

export function Link({ path, shouldReplaceHistory, scrollTo, children, ...props }: LinkProps) {
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
