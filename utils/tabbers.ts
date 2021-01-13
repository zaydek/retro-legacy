// Ex:
//
// lastConsecutiveIndex("Hello, world!", "\t") -> 0
// lastConsecutiveIndex("\tHello, world!", "\t") -> 1
// lastConsecutiveIndex("\t\tHello, world!", "\t") -> 2
// lastConsecutiveIndex("\t\t\tHello, world!", "\t") -> 3
// lastConsecutiveIndex("", "\t") -> -1
//
function lastConsecutiveIndex(str: string, ch: string) {
	if (str === "") {
		return -1
	}
	let x = 0
	while (x < str.length && str[x] === ch) {
		x++
	}
	return x
}

// TODO: Add support for space-based tabs?
export function tab(str: string, ntabs: number) {
	let rows = str.split("\n")
	const y = rows.findIndex(each => each !== "")
	rows = rows.slice(y)

	// Starts here:
	return rows.map(each => "\t".repeat(ntabs) + each)
}

// TODO: Add support for space-based tabs?
export function detab(str: string) {
	let rows = str.split("\n")
	const y = rows.findIndex(each => each !== "")
	rows = rows.slice(y)

	// Starts here:
	const xs = rows.map(each => lastConsecutiveIndex(each, "\t")).filter(each => each !== -1)
	const x = Math.min(...xs)
	const detabbed = rows.map(each => each.slice(x)).join("\n")
	return detabbed
}
