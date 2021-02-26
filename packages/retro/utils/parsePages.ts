import * as fs from "fs"
import * as log from "../../lib/log"
import * as p from "path"
import * as term from "../../lib/term"
import * as types from "../types"

// prettier-ignore
interface ParsedPath {
	src:      string // e.g. "path/to/basename.ext"
	basename: string // e.g. "basename.ext"
	name:     string // e.g. "basename"
	ext:      string // e.g. ".ext"
}

// prettier-ignore
const supported: { [key: string]: boolean } = {
	".js":  true,
	".jsx": true,
	".ts":  true,
	".tsx": true,
	".md":  true,
	".mdx": true,
}

// parsePath parses path metadata so that syntax functions don’t need to
// re-parse path metadata.
function parsePath(path: string): ParsedPath {
	const basename = p.basename(path)
	const ext = p.extname(path)
	const name = basename.slice(0, -ext.length)
	return { src: path, basename, name, ext }
}

// src/pages/index.js -> __export__/index.html
//
// TODO: Write tests.
function dst(directories: types.DirConfiguration, path: ParsedPath): string {
	const syntax = p.join(directories.exportDir, path.src.slice(directories.srcPagesDir.length))
	return syntax.slice(0, -path.ext.length) + ".html"
}

// "src/pages/component.js"          -> "PageComponent"
// "src/pages/nested/component.js"   -> "PageNestedComponent"
// "src/pages/[component].js"        -> "DynamicPageComponent"
// "src/pages/nested/[component].js" -> "DynamicPageNestedComponent"
//
// TODO: Write tests.
function toComponentSyntax(
	directories: types.DirConfiguration,
	parsed: ParsedPath,
	{ dynamic }: { dynamic: boolean },
): string {
	let path = toPathSyntax(directories, parsed)
	if (dynamic) {
		// Remove "[" and "]":
		path = path.replace(dynamicRegex, "$1$3")
	}
	let syntax = ""
	for (const part of path.split(p.sep)) {
		if (!part.length) continue
		syntax += part[0]!.toUpperCase() + part.slice(1)
	}
	syntax = syntax || "Index"
	return (dynamic ? "DynamicPage" : "Page") + syntax[0]!.toUpperCase() + syntax.slice(1)
}

// "src/pages/index.js"       -> "/"
// "src/pages/hello-world.js" -> "/hello-world"
//
// TODO: Write tests.
function toPathSyntax(directories: types.DirConfiguration, parsed: ParsedPath): string {
	const syntax = parsed.src.slice(directories.srcPagesDir.length, -parsed.ext.length)
	if (syntax.endsWith("/index")) {
		return syntax.slice(0, -"index".length)
	}
	return syntax
}

// TODO: Write tests.
function createStaticPageMeta(directories: types.DirConfiguration, parsed: ParsedPath): types.StaticPageMeta {
	const component: types.StaticPageMeta = {
		type: "static",
		src: parsed.src,
		dst: dst(directories, parsed),
		path: toPathSyntax(directories, parsed),
		component: toComponentSyntax(directories, parsed, { dynamic: false }),
	}
	return component
}

// TODO: Write tests.
function createDynamicPageMeta(directories: types.DirConfiguration, parsed: ParsedPath): types.DynamicPageMeta {
	const component: types.DynamicPageMeta = {
		type: "dynamic",
		src: parsed.src,
		component: toComponentSyntax(directories, parsed, { dynamic: true }),
	}
	return component
}

// Matches:
//
// - $1 -> "/"
// - $2 -> "["
// - $3 -> ...
// - $4 -> "]"
//
// TODO: Write tests.
const dynamicRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/

function parsePage(directories: types.DirConfiguration, parsed: ParsedPath): types.PageMeta {
	const path = toPathSyntax(directories, parsed)
	if (dynamicRegex.test(path)) {
		return createDynamicPageMeta(directories, parsed)
	}
	return createStaticPageMeta(directories, parsed)
}

async function readdirAll(src: string): Promise<ParsedPath[]> {
	const arr: ParsedPath[] = []
	async function recurse(src: string): Promise<void> {
		const ls = await fs.promises.readdir(src)
		for (const each of ls) {
			const path = p.join(src, each)
			if ((await fs.promises.stat(path)).isDirectory()) {
				arr.push(parsePath(path))
				await recurse(path)
				continue
			}
			arr.push(parsePath(path))
		}
	}
	await recurse(src)
	return arr
}

// testURICharacter tests whether a character matches URI reserved or unreserved
// characters based on RFC 3986.
function testURICharacter(char: string): boolean {
	// prettier-ignore
	if ((char >= "a" && char <= "z") || // ALPHA LOWER
			(char >= "A" && char <= "Z") || // ALPHA LOWER
			(char >= "0" && char <= "9")) { // DIGIT
		return true
	}
	// https://tools.ietf.org/html/rfc3986#section-2.3
	switch (char) {
		case "-":
		case ".":
		case "_":
		case "~":
			return true
	}
	// https://tools.ietf.org/html/rfc3986#section-2.2
	switch (char) {
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

export async function parsePages(directories: types.DirConfiguration): Promise<types.PageMeta[]> {
	const arr = await readdirAll(directories.srcPagesDir)

	// Step over:
	//
	// - "_component"
	// - "$component"
	// - "component_"
	// - "component$"
	//
	// TODO: Add support for "layout" here?
	const arr2 = arr.filter(path => {
		if (path.name.startsWith("_") || path.name.startsWith("$")) {
			return false
		} else if (path.name.endsWith("_") || path.name.endsWith("$")) {
			return false
		}
		return supported[path.ext] === true
	})

	const badSrcs: string[] = []
	for (const { src } of arr2) {
		for (let x = 0; x < src.length; x++) {
			if (!testURICharacter(src[x]!)) {
				badSrcs.push(src)
			}
		}
	}

	if (badSrcs.length > 0) {
		// TODO: Extract to errs?
		log.error(`These pages use non-URI characters:

${badSrcs.map(each => "- " + each).join("\n")}

URI characters are described by RFC 3986:

${term.dim("2.2.")} Unreserved Characters

	ALPHA / DIGIT / "-" / "." / "_" / "~"

${term.dim("2.3.")} Reserved Characters

	gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
	sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
	           / "*" / "+" / "," / ";" / "="

${term.underline("https://tools.ietf.org/html/rfc3986")}`)
	}

	const pages: types.PageMeta[] = []
	for (const parsed of arr2) {
		pages.push(parsePage(directories, parsed))
	}
	return pages
}
