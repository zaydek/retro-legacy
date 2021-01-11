import { Part } from "./types"

// prettier-ignore
function comparePartImpl(p1: Part, p2: Part) {
	const ok = (
		(p1.part === p2.part || p1.dynamic || p2.dynamic) &&
		p1.nests === p2.nests
	)
	return ok
}

export function compareParts(parts1: Part[], parts2: Part[]) {
	if (parts1.length !== parts2.length) {
		return false
	}
	let x = 0
	while (x < parts1.length) {
		if (!comparePartImpl(parts1[x]!, parts2[x]!)) {
			return false
		}
		x++
	}
	return true
}
