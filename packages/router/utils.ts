// convertToPath converts a filesystem path to a browser path.
export function convertToPath(path: string): string {
	// "/index.html" -> "/index"
	let path2 = path
	if (path2.endsWith(".html")) {
		path2 = path2.slice(0, -5)
	}
	// "/index" -> "/"
	if (path2.endsWith("/index")) {
		path2 = path2.slice(0, -5)
	}
	return path2
}

// getBrowserPath gets the current browser path (safe for SSR).
export function getBrowserPath(): string {
	let pathname = "/"
	if (typeof window !== undefined) {
		pathname = window.location.pathname
	}
	return convertToPath(pathname)
}
