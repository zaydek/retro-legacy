import { Part } from "./types"

export function parseParts(path: string) {
	const parts: Part[] = []

	let x = 0
	top: while (x < path.length) {
		if (path[x] !== "/") {
			throw new Error(`parseParts: Expected \`/\` at the start of a part; path[x]=${path[x]}.`)
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
				part: path.slice(start, end),
				dynamic: false,
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
						part: path.slice(start - 1, end + 1),
						dynamic: true,
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
