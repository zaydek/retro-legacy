// convPath converts a pathname (window.history.location) to a path.
export function convPath(pathname: string) {
	let path = pathname

	// "/index.html" -> "/index"
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	// "/index" -> /
	if (path.endsWith("/index")) {
		path = path.slice(0, -5)
	}
	return path
}

// getCurrentPath gets the current path.
export function getCurrentPath() {
	const pathname = typeof window === "undefined" ? "/" : window.location.pathname
	return convPath(pathname)
}
