// testURISafeImpl tests whether a character matches URI reserved or unreserved
// characters based on RFC 3986.
function testURISafeImpl(char: string): boolean {
	// prettier-ignore
	if (
		(char >= "a" && char <= "z") || // ALPHA LOWER
		(char >= "A" && char <= "Z") || // ALPHA LOWER
		(char >= "0" && char <= "9")    // DIGIT
	) {
		return true
	}
	switch (char) {
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
	for (const char of str) {
		if (!testURISafeImpl(char)) {
			return false
		}
	}
	return true
}
