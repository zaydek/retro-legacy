import * as fs from "fs"
import * as log from "../lib/log"
import * as p from "path"
import * as term from "../lib/term"
import * as types from "./types"

////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
interface StaticPageMeta {
	type:      "static"
	src:       string // e.g. "src/pages/index.js"
	dst:       string // e.g. "dst/index.html"
	path:      string // e.g. "/"
	component: string // e.g. "PageIndex"
}

// prettier-ignore
interface DynamicPageMeta {
	type:      "dynamic"
	src:       string // e.g. "src/pages/[index].js"
	component: string // e.g. "DynamicPageIndex"
}

type PageMeta = StaticPageMeta | DynamicPageMeta

////////////////////////////////////////////////////////////////////////////////

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
function dst(runtime: types.Runtime, path: ParsedPath): string {
	const syntax = p.join(runtime.dir.exportDir, path.src.slice(runtime.dir.srcPagesDir.length))
	return syntax.slice(0, -path.ext.length) + ".html"
}

// "src/pages/component.js"          -> "PageComponent"
// "src/pages/nested/component.js"   -> "PageNestedComponent"
// "src/pages/[component].js"        -> "DynamicPageComponent"
// "src/pages/nested/[component].js" -> "DynamicPageNestedComponent"
//
// TODO: Write tests.
function toComponentSyntax(runtime: types.Runtime, parsed: ParsedPath, { dynamic }: { dynamic: boolean }): string {
	// Remove "[" and "]":
	let path = toPathSyntax(runtime, parsed)
	if (dynamic) {
		path = path.replace(dynamicRegex, "$1$3")
	}

	let syntax = path
		.split(p.sep)
		.map(each => {
			if (!each.length) return ""
			return each[0]!.toUpperCase() + each.slice(1)
		})
		.join("")

	// Cover "/" edge case:
	if (syntax === "") {
		syntax = "index"
	}
	return (dynamic ? "DynamicPage" : "Page") + syntax[0]!.toUpperCase() + syntax.slice(1)
}

// "src/pages/index.js" -> "/"
// "src/pages/hello-world.js" -> "/hello-world"
//
// TODO: Write tests.
function toPathSyntax(runtime: types.Runtime, parsed: ParsedPath): string {
	const syntax = parsed.src.slice(runtime.dir.srcPagesDir.length, -parsed.ext.length)
	if (syntax.endsWith("/index")) {
		return syntax.slice(0, -"index".length)
	}
	return syntax
}

// TODO: Write tests.
function createStaticPageMeta(runtime: types.Runtime, parsed: ParsedPath): StaticPageMeta {
	const component: StaticPageMeta = {
		type: "static",
		src: parsed.src,
		dst: dst(runtime, parsed),
		path: toPathSyntax(runtime, parsed),
		component: toComponentSyntax(runtime, parsed, { dynamic: false }),
	}
	return component
}

// TODO: Write tests.
function createDynamicPageMeta(runtime: types.Runtime, parsed: ParsedPath): DynamicPageMeta {
	const component: DynamicPageMeta = {
		type: "dynamic",
		src: parsed.src,
		component: toComponentSyntax(runtime, parsed, { dynamic: true }),
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

function createFilesystemRoute(runtime: types.Runtime, parsed: ParsedPath): PageMeta {
	const path = toPathSyntax(runtime, parsed)
	if (dynamicRegex.test(path)) {
		return createDynamicPageMeta(runtime, parsed)
	}
	return createStaticPageMeta(runtime, parsed)
}

async function readdirAll(dir: string): Promise<ParsedPath[]> {
	const arr: ParsedPath[] = []
	async function recurse(dir: string): Promise<void> {
		const ls = await fs.promises.readdir(dir)
		for (const each of ls) {
			const path = p.join(dir, each)
			if ((await fs.promises.stat(path)).isDirectory()) {
				arr.push(parsePath(path))
				await recurse(path)
				continue
			}
			arr.push(parsePath(path))
		}
	}
	await recurse(dir)
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

// newFilesystemRouter creates a new filesystem-based router from src/pages.
export default async function newFilesystemRouter(runtime: types.Runtime): Promise<PageMeta[]> {
	const arr = await readdirAll(runtime.dir.srcPagesDir)

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
		log.error(`These pages use non-URI characters:

${badSrcs.map(each => "- " + each).join("\n")}

URI characters are described by RFC 3986:

2.2. Unreserved Characters

  ALPHA / DIGIT / "-" / "." / "_" / "~"

2.3. Reserved Characters

  gen-delims = ":" / "/" / "?" / "#" / "[" / "]" /
  sub-delims = "@" / "!" / "$" / "&" / "'" / "(" / ")"
             / "*" / "+" / "," / ";" / "="

${term.boldUnderline("https://tools.ietf.org/html/rfc3986")}`)
	}

	const router: PageMeta[] = []
	for (const parsed of arr2) {
		router.push(createFilesystemRoute(runtime, parsed))
	}
	return router
}
