import * as term from "../lib/term"
import * as types from "./types"

////////////////////////////////////////////////////////////////////////////////
// CLI
////////////////////////////////////////////////////////////////////////////////

export function badCLIRunCommand(run: string): string {
	return `Bad run command ${term.magenta(`'${run}'`)}.

Supported commands:

retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build

${term.yellow("hint:")} Use ${term.magenta("'retro usage'")} for usage.`
}

////////////////////////////////////////////////////////////////////////////////
// Document (index.html)
////////////////////////////////////////////////////////////////////////////////

export function missingDocumentHeadTag(path: string): string {
	return `${path}: Add ${term.magenta("'%head%'")} somewhere to ${term.magenta("'<head>'")}.

For example:

${term.dim(`// ${path}`)}
<!DOCTYPE html>
	<head lang="en">
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		${term.magenta("%head%")}
		${term.dim("...")}
	</head>
	<body>
		${term.dim("...")}
	</body>
</html>`
}

export function missingDocumentPageTag(path: string): string {
	return `${path}: Add ${term.magenta("'%page%'")} somewhere to ${term.magenta("'<body>'")}.

For example:

${term.dim(`// ${path}`)}
<!DOCTYPE html>
	<head lang="en">
		${term.dim("...")}
	</head>
	<body>
		${term.magenta("%page%")}
		${term.dim("...")}
	</body>
</html>`
}

////////////////////////////////////////////////////////////////////////////////
// Pages
////////////////////////////////////////////////////////////////////////////////

export function pagesUseNonURICharacters(badSrcs: string[]): string {
	return `These pages use non-URI characters:

${badSrcs.map(page => "- " + page).join("\n")}

URI characters are described by RFC 3986:

2.2. Unreserved Characters

	ALPHA / DIGIT / "-" / "." / "_" / "~"

2.3. Reserved Characters

	gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
	sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
	${"\x20".repeat(11)}/ "*" / "+" / "," / ";" / "="

${term.underline.cyan("https://tools.ietf.org/html/rfc3986")}`
}

////////////////////////////////////////////////////////////////////////////////
// Server API (static pages)
////////////////////////////////////////////////////////////////////////////////

export function serverPropsFunction(src: string): string {
	return `${src}.serverProps: ${term.magenta("'serverProps'")} must be a function.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ${term.dim("...")} }
}

Or:

${term.dim(`// ${src}`)}
export async function serverProps() {
	await ${term.dim("...")}
	return { ${term.dim("...")} }
}`
}

export function serverPropsReturn(src: string): string {
	return `${src}.serverProps: Bad ${term.magenta("'serverProps'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ${term.dim("...")} }
}`
}

export function serverPathsMismatch(src: string): string {
	return `${src}: Use ${term.magenta("'serverProps'")} for non-dynamic pages, not ${term.magenta("'serverPaths'")}.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ${term.dim("...")} }
}`
}

////////////////////////////////////////////////////////////////////////////////
// Server API (dynamic pages)
////////////////////////////////////////////////////////////////////////////////

export function serverPathsFunction(src: string): string {
	return `${src}.serverPaths: ${term.magenta("'serverPaths'")} must be a function.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return { ${term.dim("...")} }
}

Or:

${term.dim(`// ${src}`)}
export async function serverPaths() {
	await ${term.dim("...")}
	return { ${term.dim("...")} }
}`
}

export function serverPathsReturn(src: string): string {
	return `
${src}.serverPaths: Bad ${term.magenta("'serverPaths'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ${term.dim("...")} },
		{ path: "/foo/bar", props: ${term.dim("...")} },
		{ path: "/foo/bar/baz", props: ${term.dim("...")} },
	]
}`
}

export function serverPropsMismatch(src: string): string {
	return `${src}: Use ${term.magenta("'serverPaths'")} for dynamic pages, not ${term.magenta("'serverProps'")}.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ${term.dim("...")} },
		{ path: "/foo/bar", props: ${term.dim("...")} },
		{ path: "/foo/bar/baz", props: ${term.dim("...")} },
	]
}`
}

////////////////////////////////////////////////////////////////////////////////
// Server API (miscellaneous)
////////////////////////////////////////////////////////////////////////////////

export function duplicatePathFound(r1: types.Route, r2: types.Route): string {
	function caller(r: types.Route): string {
		return r.type === "static" ? "serverProps" : "serverPaths"
	}
	return `${r1.src}.${caller(r1)}: Path ${term.magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

////////////////////////////////////////////////////////////////////////////////
// Serve command
////////////////////////////////////////////////////////////////////////////////

export function serveWithoutExport(): string {
	return `It looks like you’re trying to run ${term.magenta("'retro serve'")} before ${term.magenta(
		"'retro export'",
	)}. Try ${term.magenta("'retro export && retro serve'")}.`
}
