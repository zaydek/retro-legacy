interface Part {
	part: string
	dynamic: boolean
	nests: boolean
}

// Parses parts from a dynamic path.
export function parseDynamicPaths(path: string) {
	const parts: Part[] = []

	let x = 0
	top: while (x < path.length) {
		if (path[x] !== "/") {
			throw new Error(`parseDynamicPaths: Expected \`/\` at the start of a part; path[x]=${path[x]}.`)
		}

		// Step-over `/`:
		x++
		if (x === path.length) {
			break
		}

		// Start of a non-dynamic part:
		if (path[x] !== "[") {
			let start = 0
			let end = 0

			// Iterate to next part:
			start = x
			x++
			// prettier-ignore
			while (x < path.length && path[x] !== "/") { // Iterate to `/`
				x++
			}
			end = x
			parts.push({
				// The part; `part`.
				part: path.slice(start, end),
				// Is the part dynamic?
				dynamic: false,
				// Whether the part nests other parts.
				nests: path[x] == "/",
			})
			continue
		}

		// Start of a dynamic part:
		if (path[x] === "[") {
			let start = 0
			let end = 0

			// Scan the current part:
			x++
			start = x
			while (x < path.length) {
				// prettier-ignore
				if (path[x] === "]") { // Iterate to `]`
					end = x
					parts.push({
						// The part; `part`.
						part: path.slice(start - 1, end + 1),
						// Is the part dynamic?
						dynamic: true,
						// Whether the part nests other parts.
						nests: x + 1 < path.length && path[x + 1] == "/",
					})
					x++
					continue top
				}
				x++
			}
		}
	}

	if (!parts.length) {
		return null
	}
	return parts
}

// // Compares parsed parts to a path.
// export function comparePartsToPath(parts: Part[], path: string) {
// 	let partsX = 0
//
// 	let x= 0
// 	while ( x < path.length) {
// 		if (path[x] === "/") {
// 			if (partsX < parts.length) {
// 				return false
// 			}
// 			while (x < path.length && path[x] !== "/")  {
// 				x++
// 			}
// 			if (parts[partsX].)
// 		}
// 	x++
// 	}
// }
