import * as path from "path"

// prettier-ignore
export interface ParsedPath {
	src: string      // e.g. "path/to/basename.ext"
	basename: string // e.g. "basename.ext"
	name: string     // e.g. "basename"
	ext: string      // e.g. ".ext"
}

export function parse(src: string): ParsedPath {
	const basename = path.basename(src)
	const ext = path.extname(src)
	const name = basename.slice(0, -ext.length)
	return { src, basename, name, ext }
}
