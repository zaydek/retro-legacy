export type ScrollTo = "no-op" | number | string | HTMLElement

// scrollToImpl scrolls to an offset (number) or selector (string). Use "no-op"
// to opt out of scrolling because <Link> and <Redirect> automatically scroll to
// the top of the page.
//
// TODO: Add unit tests.
export function scrollToImpl(scrollTo?: ScrollTo) {
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
