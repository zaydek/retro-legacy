import * as term from "../lib/term"
import * as types from "./types"

export function missingHeadTemplateTag(path: string): string {
	return `${path}: Add ${term.cyan("'%head%'")} somewhere to ${term.cyan("'<head>'")}.

For example:

${term.dim(`// ${path}`)}
...
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	${term.cyan("%head%")}
</head>
...`
}

export function missingPageTemplateTag(path: string): string {
	return `${path}: Add ${term.cyan("'%page%'")} somewhere to ${term.cyan("'<body>'")}.

For example:

${term.dim(`// ${path}`)}
...
<body>
	${term.cyan("%page%")}
</body>
...`
}

// prettier-ignore
export function serverPropsFunction(src: string): string {
	return `${src}: ${term.cyan("'typeof serverProps !== \"function\"'")}; ${term.cyan("'serverProps'")} must be a synchronous or an asynchronous function.

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

// prettier-ignore
export function serverPathsFunction(src: string): string {
	return `${src}: ${term.cyan("'typeof serverPaths !== \"function\"'")}; ${term.cyan("'serverPaths'")} must be a synchronous or an asynchronous function.

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

export function serverPropsMismatch(src: string): string {
	return `${src}: Dynamic pages must use ${term.cyan("'serverPaths'")} not ${term.cyan("'serverProps'")}.

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

export function serverPropsReturn(src: string): string {
	return `${src}.serverProps: Bad ${term.cyan("'serverProps'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

export function serverPathsReturn(src: string): string {
	return `${src}.serverPaths: Bad ${term.cyan("'serverPaths'")} resolver.

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

export function serverPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use ${term.cyan("'serverProps'")} not ${term.cyan("'serverPaths'")}.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

export function duplicatePathFound(r1: types.ServerRoute, r2: types.ServerRoute): string {
	function caller(r: types.ServerRoute): string {
		return r.type === "static" ? "serverProps" : "serverPaths"
	}
	return `${r1.src}.${caller(r1)}: Path ${term.cyan(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

// prettier-ignore
export function serveWithoutExport(): string {
	return `It looks like you’re trying to run ${term.cyan("'retro serve'")} before ${term.cyan("'retro export'")}. Try ${term.cyan("'retro export && retro serve'")}.`
}
