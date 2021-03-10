// getBrowserPath gets the current path (SSR safe).
export function getBrowserPath(): string {
	let path = "/"
	if (typeof window !== "undefined") {
		path = window.location.pathname
	}
	// "/index.html" -> "/index"
	// "/index"      -> "/"
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
		if (path.endsWith("/index")) {
			path = path.slice(0, -5)
		}
	}
	return path
}
