import * as types from "./types"

export function scrollToImpl(scrollTo?: types.ScrollTo) {
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
			// TODO: Add support for scroll-padding-top for element types?
			const el = document.querySelector(scrollTo)
			if (el) {
				window.scrollTo(0, el.getBoundingClientRect().y)
			}
			break
		default:
			break
	}
}
