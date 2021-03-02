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
	return `${path}: Add ${term.magenta("'%head%'")} to ${term.magenta("'<head>'")}.

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
	return `${path}: Add ${term.magenta("'%page%'")} to ${term.magenta("'<body>'")}.

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

export function pagesUseNonURICharacters(pages: string[]): string {
	return `These pages use non-URI characters:

${pages.map(page => "- " + page).join("\n")}

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
// Server API
////////////////////////////////////////////////////////////////////////////////

export function badStaticPageExports(src: string): string {
	return `${src}: Bad static page exports.

Page exports should look something like this:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ${term.dim("...")} }
}

export function Head({ path, ...serverProps }) {
	return <title>Hello, world!</title>
}

export default function Page({ path, ...serverProps }) {
	return <h1>Hello, world!</h1>
}`
}

export function badDynamicPageExports(src: string): string {
	return `${src}: Bad dynamic page exports.

Dynamic page exports should look something like this:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ${term.dim("...")} },
		{ path: "/foo/bar", props: ${term.dim("...")} },
		{ path: "/foo/bar/baz", props: ${term.dim("...")} },
	]
}

export function Head({ path, ...serverProps }) {
	return <title>Hello, world!</title>
}

export default function Page({ path, ...serverProps }) {
	return <h1>Hello, world!</h1>
}`
}

export function badServerPropsResolver(src: string): string {
	return `${src}.serverProps: Bad ${term.magenta("'serverProps'")} resolver.

Your ${term.magenta("'serverProps'")} resolver should look something like this:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ${term.dim("...")} }
}`
}

export function badServerPathsResolver(src: string): string {
	return `
${src}.serverPaths: Bad ${term.magenta("'serverPaths'")} resolver.

Your ${term.magenta("'serverPaths'")} resolver should look something like this:

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

export function duplicatePathFound(r1: types.RouteInfo, r2: types.RouteInfo): string {
	function caller(r: types.RouteInfo): string {
		return r.type === "static" ? "serverProps" : "serverPaths"
	}
	return `${r1.src}.${caller(r1)}: Path ${term.magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

////////////////////////////////////////////////////////////////////////////////
// Serve command
////////////////////////////////////////////////////////////////////////////////

export function serveWithMissingExportDirectory(): string {
	return `It looks like you’re trying to run ${term.magenta("'retro serve'")} before ${term.magenta(
		"'retro export'",
	)}. Try ${term.magenta("'retro export && retro serve'")}.`
}
