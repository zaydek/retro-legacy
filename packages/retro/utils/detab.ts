export function detab(str: string, keep = 0): string {
	let offsets: number[] = []

	const arr = str.trimEnd().split("\n")
	for (const each of arr) {
		if (each.length === 0) continue
		let offset = 0
		while (offset < each.length) {
			if (each[offset] !== "\t") {
				// No-op
				break
			}
			offset++
		}
		offsets.push(offset)
	}

	offsets = offsets.filter(each => each !== 0)
	const offset = Math.min(...offsets)
	return arr.map(each => "\t".repeat(keep) + each.slice(offset)).join("\n") + "\n" // EOF
}
