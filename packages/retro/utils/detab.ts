const EOF = "\n"

// detab removes the leading tabs from a string. An EOF is delimited for
// multiline strings.
export function detab(str: string, keep = 0): string {
	let xs: number[] = []
	const lines = str.trimEnd().split("\n")
	for (const line of lines) {
		if (line.length === 0) continue
		let x = 0
		while (x < line.length) {
			if (line[x] !== "\t") {
				break
			}
			x++
		}
		xs.push(x)
	}
	const x = Math.min(...xs)

	// prettier-ignore
	return lines.map(line => "\t".repeat(keep) + line.slice(x)).join("\n") +
		(lines.length === 1 ? "" : EOF)
}
