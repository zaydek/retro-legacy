// testURISafeCharacter tests whether a character matches a reserved or
// unreserved URI character based on RFC 3986.
function testURISafeCharacter(ch: string): boolean {
	// prettier-ignore
	if (
		(ch >= "a" && ch <= "z") || // ALPHA LOWER
		(ch >= "A" && ch <= "Z") || // ALPHA LOWER
		(ch >= "0" && ch <= "9")    // DIGIT
	) {
		return true
	}
	switch (ch) {
		// https://tools.ietf.org/html/rfc3986#section-2.3
		case "-":
		case ".":
		case "_":
		case "~":
		// https://tools.ietf.org/html/rfc3986#section-2.2
		case ":":
		case "/":
		case "?":
		case "#":
		case "[":
		case "]":
		case "@":
		case "!":
		case "$":
		case "&":
		case "'":
		case "(":
		case ")":
		case "*":
		case "+":
		case ",":
		case ";":
		case "=":
			return true
	}
	return false
}

export function testURISafe(str: string): boolean {
	for (const ch of str) {
		if (!testURISafeCharacter(ch)) {
			return false
		}
	}
	return true
}
