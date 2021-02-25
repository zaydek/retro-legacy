import * as term from "../lib/term"
import * as types from "./types"

export function serverPropsFunction(src: string): string {
	return `${src}: 'typeof serverProps !== "function"'; 'serverProps' must be a synchronous or an asynchronous function.

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

export function serverPathsFunction(src: string): string {
	return `${src}: 'typeof serverPaths !== "function"'; 'serverPaths' must be a synchronous or an asynchronous function.

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
	return `${src}: Dynamic pages must use 'serverPaths' not 'serverProps'.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`
}

export function serverPropsReturn(src: string): string {
	return `${src}.serverProps: 'serverProps' does not resolve to a server props object.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

export function serverPathsReturn(src: string): string {
	return `${src}.serverPaths: 'serverPaths' does not resolve to a server paths object.

For example:

${term.dim(`// ${src}`)}
export function serverPaths() {
	return [
		{ path: "/foo", props: ... },
		{ path: "/foo/bar", props: ... },
		{ path: "/foo/bar/baz", props: ... },
	]
}

Note paths are directory-scoped.`
}

export function serverPathsMismatch(src: string): string {
	return `${src}: Non-dynamic pages must use 'serverProps' not 'serverPaths'.

For example:

${term.dim(`// ${src}`)}
export function serverProps() {
	return { ... }
}`
}

export function pathExists(r1: types.ServerRoute, r2: types.ServerRoute): string {
	return `${r1.src}: Path '${r1.path}' is already being used by ${r2.src}.`
}
