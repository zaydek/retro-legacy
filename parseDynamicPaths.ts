export default function parseDynamicPaths(path: string) {
	const dynamicPaths = []

	let x = 0
	outer: while (x < path.length) {
		if (path[x] !== "/") {
			throw new Error(`parseDynamicPaths: Expected \`/\` at the start of a part; path[x]=${path[x]}.`)
		}
		// Step-over `/`:
		x++

		// Start of a dynamic path:
		if (x < path.length && path[x] === "[") {
			// Scan the current part:
			let start = 0
			let end = 0
			x++
			start = x
			inner: while (x < path.length) {
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
					continue outer
				}
				x++
			}
		} else {
			// Iterate to next part:
			x++
			while (x < path.length && path[x] !== "/") {
				x++
			}
			continue
		}
		x++
	}

	if (!dynamicPaths.length) {
		return null
	}
	return dynamicPaths
}
