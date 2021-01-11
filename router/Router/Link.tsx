import React from "react"
import { history } from "./history"

type ScrollTo = "no-op" | number | string | HTMLElement

function scrollImpl(scrollTo?: ScrollTo) {
	let el = null
	switch (typeof scrollTo) {
		case "undefined":
			window.scrollTo(0, 0)
			break
		case "number":
			window.scrollTo(0, scrollTo)
			break
		case "string":
			if (scrollTo === "no-op") {
				// No-op
				return
			}
			// TODO: Add support for `scroll-padding-top`?
			el = document.querySelector(scrollTo)
			if (!el) {
				console.error(`Link: document.querySelector(${JSON.stringify(scrollTo)}) returned \`${el}\`.`)
			} else {
				window.scrollTo(0, el.getBoundingClientRect().y)
			}
			break
		default:
			break
	}
}

// TODO: Is `React.HTMLAttributes<HTMLElement>` right?
export interface LinkProps extends React.HTMLAttributes<HTMLElement> {
	page: string
	children?: React.ReactNode
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
}

export function Link({ page, children, shouldReplaceHistory, scrollTo, ...props }: LinkProps) {
	function handleClick(e: React.MouseEvent) {
		e.preventDefault()
		const fn = shouldReplaceHistory ? history.replace : history.push
		fn(page)
		scrollImpl(scrollTo)
	}
	return (
		<a href={page} onClick={handleClick} {...props}>
			{children}
		</a>
	)
}
