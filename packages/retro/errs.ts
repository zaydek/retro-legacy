import * as term from "../lib/term"
import * as types from "./types"

export function missingHeadTemplateTag(path: string): string {
	return `${path}: Add ${term.magenta("'%head%'")} somewhere to ${term.magenta("'<head>'")}.

For example:

${term.dim(`// ${path}`)}
...
<head>
	<meta charset="utf-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	${term.magenta("%head%")}
</head>
...`
}

export function missingPageTemplateTag(path: string): string {
	return `${path}: Add ${term.magenta("'%page%'")} somewhere to ${term.magenta("'<body>'")}.

For example:

${term.dim(`// ${path}`)}
...
<body>
	${term.magenta("%page%")}
</body>
...`
}

// prettier-ignore
export function serverPropsFunction(src: string): string {
	return `${src}: ${term.magenta("'typeof serverProps !== \"function\"'")}; ${term.magenta("'serverProps'")} must be a synchronous or an asynchronous function.

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
	return `${src}: ${term.magenta("'typeof serverPaths !== \"function\"'")}; ${term.magenta("'serverPaths'")} must be a synchronous or an asynchronous function.

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

export function serverPropsReturn(src: string): string {
	return `${src}.serverProps: Bad ${term.magenta("'serverProps'")} resolver.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

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

export function serverPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use ${term.magenta("'serverProps'")} not ${term.magenta("'serverPaths'")}.

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
	return `${r1.src}.${caller(r1)}: Path ${term.magenta(`'${r1.path}'`)} used by ${r2.src}.${caller(r2)}.`
}

// prettier-ignore
export function serveWithoutExport(): string {
	return `It looks like you’re trying to run ${term.magenta("'retro serve'")} before ${term.magenta("'retro export'")}. Try ${term.magenta("'retro export && retro serve'")}.`
}
