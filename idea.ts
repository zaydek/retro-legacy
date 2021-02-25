import * as log from "./packages/lib/log"
import * as term from "./packages/lib/term"

const src = "pages/pokemon.js"

log.error(`${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}`)
