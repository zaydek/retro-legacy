// Matches non-dynamic paths:
//
// - /
// - /hello
// - /hello/
// - /hello/world
// - /hello/world/
//
// Matches dynamic paths:
//
// - /[hello]
// - /[hello]/
// - /[hello]/[world]
// - /[hello]/[world]/
//
// https://regex101.com/r/7uE183/1
const validRegexp = /^\/(?:(?:\w+|\[\w+\])\/?)*$/

// Parses parts from a path. The path can be a route or a path (use
// { validatePath: true } for routes).
function parseParts(pathname, { validatePath } = { validatePath: true }) {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}

	if (validatePath && !validRegexp.test(path)) {
		throw new Error(
			`parseParts: Cannot parse path=${JSON.stringify(path)}. ` +
				`Routes must use some combination of non-dynamic syntax such as /hello/world or dynamic syntax such as /[hello]/[world].` +
				`The leading slash is required but the trailing slash is optional.`,
		)
	}

	const parts = [
		// {
		//   id: "hello-world",
		//   dynamic: false,
		//   nests: false,
		// },
	]

	// Step over "/":
	let x1 = 1
	while (x1 < path.length) {
		const found = path[x1] === "["
		if (!found) {
			let x2 = x1
			while (x2 < path.length) {
				if (path[x2] === "/") {
					// No-op
					break
				}
				x2++
			}
			const id = path.slice(x1, x2)
			const dynamic = false
			const nests = path.charAt(x2) === "/"
			parts.push({ id, dynamic, nests })
			x1 = x2
		} else {
			let x2 = x1
			while (x2 < path.length) {
				if (path[x2] === "]") {
					// No-op
					break
				}
				x2++
			}
			// Step over "]":
			x2++
			const id = path.slice(x1 + 1, x2 - 1)
			const dynamic = true
			// NOTE: Use path.charAt(x2) because path[x2] cannot be guaranteed.
			const nests = path.charAt(x2) === "/"
			parts.push({ id, dynamic, nests })
			x1 = x2
		}
		// Step over "/":
		x1++
	}
	return parts
}

// Implementation for compareParts.
function comparePartsImpl(src_parts, cmp_parts, { strict } = { strict: true }) {
	// prettier-ignore
	const ok = (
		(src_parts.id === cmp_parts.id || src_parts.dynamic) &&
		(!strict || src_parts.nests === cmp_parts.nests)
	)
	return ok
}

// Compares a set of parts.
function compareParts(src_parts, cmp_parts, { strict } = { strict: true }) {
	if (src_parts.length !== cmp_parts.length) {
		return false
	}
	let x = 0
	while (x < src_parts.length) {
		if (!comparePartsImpl(src_parts[x], cmp_parts[x], { strict })) {
			return false
		}
		x++
	}
	return true
}

// Parses params (URL parameters) from a set of parts.
function parseParams(src_parts, cmp_parts, { strict } = { strict: true }) {
	const params = {}
	if (!compareParts(src_parts, cmp_parts, { strict })) {
		return null
	}
	let x = 0
	while (x < src_parts.length) {
		if (src_parts[x].dynamic) {
			params[[src_parts[x].id]] = cmp_parts[x].id
		}
		x++
	}
	return params
}

module.exports = { validRegexp, parseParts, compareParts, parseParams }
