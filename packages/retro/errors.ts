import * as terminal from "../lib/terminal"
import * as types from "./types"

////////////////////////////////////////////////////////////////////////////////
// CLI
////////////////////////////////////////////////////////////////////////////////

export function badCLIRunCommand(run: string): string {
	return `Bad run command ${terminal.magenta(`'${run}'`)}.

Supported commands:

retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build

${terminal.yellow("hint:")} Use ${terminal.magenta("'retro usage'")} for usage.`
}

////////////////////////////////////////////////////////////////////////////////
// Document (index.html)
////////////////////////////////////////////////////////////////////////////////

export function missingDocumentHeadTag(path: string): string {
	return `${path}: Add ${terminal.magenta("'%head%'")} to ${terminal.magenta("'<head>'")}.

For example:

${terminal.dim(`// ${path}`)}
<!DOCTYPE html>
  <head lang="en">
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    ${terminal.magenta("%head%")}
    ${terminal.dim("...")}
  </head>
  <body>
    ${terminal.dim("...")}
  </body>
</html>`
}

export function missingDocumentPageTag(path: string): string {
	return `${path}: Add ${terminal.magenta("'%page%'")} to ${terminal.magenta("'<body>'")}.

For example:

${terminal.dim(`// ${path}`)}
<!DOCTYPE html>
  <head lang="en">
    ${terminal.dim("...")}
  </head>
  <body>
    ${terminal.magenta("%page%")}
    ${terminal.dim("...")}
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

${terminal.underline.cyan("https://tools.ietf.org/html/rfc3986")}`
}

////////////////////////////////////////////////////////////////////////////////
// Server API
////////////////////////////////////////////////////////////////////////////////

export function badStaticPageExports(src: string): string {
	return `${src}: Bad static page exports.

Static page exports should look something like this:

${terminal.dim(`// ${src}`)}
export function serverProps() { ${terminal.dim(`// Optional`)}
  return { ${terminal.dim("...")} }
}

export function Head({ path, ...serverProps }) { ${terminal.dim(`// Optional`)}
  return <title>Hello, world!</title>
}

export default function Page({ path, ...serverProps }) {
  return <h1>Hello, world!</h1>
}`
}

export function badDynamicPageExports(src: string): string {
	return `${src}: Bad dynamic page exports.

Dynamic page exports should look something like this:

${terminal.dim(`// ${src}`)}
export function serverPaths() {
  return [
    { path: "/foo", props: ${terminal.dim("...")} },
    { path: "/foo/bar", props: ${terminal.dim("...")} },
    { path: "/foo/bar/baz", props: ${terminal.dim("...")} },
  ]
}

export function Head({ path, ...serverProps }) { ${terminal.dim(`// Optional`)}
  return <title>Hello, world!</title>
}

export default function Page({ path, ...serverProps }) {
  return <h1>Hello, world!</h1>
}`
}

export function badServerPropsResolver(src: string): string {
	return `${src}.serverProps: Bad ${terminal.magenta("'serverProps'")} resolver.

${terminal.magenta("'serverProps'")} resolvers should look something like this:

${terminal.dim(`// ${src}`)}
export function serverProps() {
  return { ${terminal.dim("...")} }
}`
}

export function badServerPathsResolver(src: string): string {
	return `${src}.serverPaths: Bad ${terminal.magenta("'serverPaths'")} resolver.

${terminal.magenta("'serverPaths'")} resolvers should look something like this:

${terminal.dim(`// ${src}`)}
export function serverPaths() {
  return [
    { path: "/foo", props: ${terminal.dim("...")} },
    { path: "/foo/bar", props: ${terminal.dim("...")} },
    { path: "/foo/bar/baz", props: ${terminal.dim("...")} },
  ]
}`
}

////////////////////////////////////////////////////////////////////////////////
// Server API (miscellaneous)
////////////////////////////////////////////////////////////////////////////////

export function duplicatePath(r1: types.RouteInfo, r2: types.RouteInfo): string {
	function caller(r: types.RouteInfo): string {
		return r.type === "static" ? "serverProps" : "serverPaths"
	}
	return `${r1.src}.${caller(r1)}: Path ${terminal.magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

////////////////////////////////////////////////////////////////////////////////
// Serve command
////////////////////////////////////////////////////////////////////////////////

export function serveWithMissingExportDirectory(): string {
	return `It looks like you’re trying to run ${terminal.magenta("'retro serve'")} before ${terminal.magenta(
		"'retro export'",
	)}. Try ${terminal.magenta("'retro export && retro serve'")}.`
}
