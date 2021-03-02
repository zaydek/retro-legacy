import * as term from "../lib/term"
import * as types from "./types"

// badRunCommand describes a bad CLI run command.
export function badRunCommand(run: string): string {
	return `Bad command ${term.magenta(`'${run}'`)}.

Supported commands:

retro dev     Start the dev server
retro export  Export the production-ready build (SSG)
retro serve   Serve the production-ready build

${term.yellow("hint:")} Use ${term.magenta("'retro usage'")} for usage.`
}

// missingHeadTemplateTag describes public/index.html without %head%.
export function missingHeadTemplateTag(path: string): string {
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

// missingPageTemplateTag describes public/index.html without %page%.
export function missingPageTemplateTag(path: string): string {
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

// serverPropsFunction describes an exported, non-function serverProps.
export function serverPropsFunction(src: string): string {
	return `${src}.serverProps: ${term.magenta("'typeof serverProps !== \"function\"'")}; ${term.magenta(
		"'serverProps'",
	)} must be a function.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}

Or:

${term.dim(`// ${src}`)}
export async function serverProps() {
	await ...
	return { ... }
}`
}

// serverPathsFunction describes an exported, non-function serverPaths.
export function serverPathsFunction(src: string): string {
	return `${src}.serverPaths: ${term.magenta("'typeof serverPaths !== \"function\"'")}; ${term.magenta(
		"'serverPaths'",
	)} must be a function.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return { ... }
}

Or:

${term.dim(`// ${src}`)}
export async function serverPaths() {
	await ...
	return { ... }
}`
}

// TODO: Add a descriptive comment.
export function serverPropsMismatch(src: string): string {
	return `${src}: Dynamic pages must use ${term.magenta("'serverPaths'")} not ${term.magenta("'serverProps'")}.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}`
}

// TODO: Add a descriptive comment.
export function serverPropsReturn(src: string): string {
	return `${src}.serverProps: Bad ${term.magenta("'serverProps'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

// TODO: Add a descriptive comment.
export function serverPathsReturn(src: string): string {
	return `${src}.serverPaths: Bad ${term.magenta("'serverPaths'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}`
}

// TODO: Add a descriptive comment.
export function serverPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use ${term.magenta("'serverProps'")} not ${term.magenta("'serverPaths'")}.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

// TODO: Add a descriptive comment.
export function duplicatePathFound(r1: types.Route, r2: types.Route): string {
	function caller(r: types.Route): string {
		return r.type === "static" ? "serverProps" : "serverPaths"
	}
	return `${r1.src}.${caller(r1)}: Path ${term.magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

// TODO: Add a descriptive comment.
// prettier-ignore
export function serveWithoutExport(): string {
	return `It looks like you’re trying to run ${term.magenta("'retro serve'")} before ${term.magenta("'retro export'")}. Try ${term.magenta("'retro export && retro serve'")}.`
}
