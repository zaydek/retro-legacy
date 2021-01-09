// Ex:
//
// detab(`
//   #foo {
//     bar: baz;
//   }
// `)
//
// -> #foo {
// ->   bar: baz;
// -> }
//
export default function detab(str: string) {
	// ^\n
	let detabbed = str
	if (detabbed.length > 0 && detabbed[0] === "\n") {
		detabbed = detabbed.slice(1)
	}
	// \n$
	if (detabbed.length > 0 && str[str.length - 1] === "\n") {
		str = detabbed.slice(0, -1)
	}
	// Iterate to non-tab:
	let tabCount = 0
	for (let x = 0; x < detabbed.length; x++) {
		if (detabbed[x] !== "\t") {
			// No-op
			break
		}
		tabCount++
	}
	// prettier-ignore
	if (tabCount > 0) {
		detabbed = detabbed.split("\n").map(each => each.slice(tabCount)).join("\n")
	}
	return detabbed
}
