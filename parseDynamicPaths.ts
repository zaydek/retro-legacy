export default function parseDynamicPaths(path: string) {
	const dynamicPaths = []

	let x = 0
	while (x < path.length) {
		if (path[x] !== "/") {
			// error condition
		}
		// Start of a dynamic path:
		if (path[x] === "[") {
			let start = 0
			let end = 0
			x++
			start = x
			while (x < path.length) {
				// Emit a dynamic path:
				if (path[x] === "]") {
					end = x
					dynamicPaths.push({
						// The part; `[part]`.
						part: path.slice(start - 1, end + 1),
						// The name of the part; `part`.
						partName: path.slice(start, end),
						// Whether the part nests other parts.
						nests: end + 1 < path.length && path[x + 1] == "/",
					})
					x++
					break
				}
				x++
			}
		}
		x++
	}

	if (!dynamicPaths.length) {
		return null
	}
	return dynamicPaths
}
