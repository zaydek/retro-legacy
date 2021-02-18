import * as types from "./types"

// Synthetic scrollTo implementation.
export function scrollToImpl(scrollTo: undefined | types.ScrollTo) {
	if (typeof scrollTo === "number") {
		window.scrollTo(0, scrollTo)
		return
	}
	// prettier-ignore
	if (Array.isArray(scrollTo) && scrollTo.length === 2 &&
			typeof scrollTo[0] === "number" && typeof scrollTo[1] === "number") {
		window.scrollTo(...scrollTo)
		return
	}
}

// Converts a pathname (window.history.pathname) to a path.
function convertPath(pathname: string): string {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	return path
}

// Gets the current path (SSR OK).
export function getPath() {
	const pathname = typeof window === "undefined" ? "/" : window.location.pathname
	return convertPath(pathname)
}
