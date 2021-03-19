import * as path from "path"

// prettier-ignore
export interface PathInfo {
	source: string   // e.g. "path/to/basename.ext"
	dirname: string  // e.g. "path/to"
	basename: string // e.g. "basename.ext"
	name: string     // e.g. "basename"
	extname: string  // e.g. ".ext"
}

export function newPathInfo(source: string): PathInfo {
	const dirname = path.dirname(source)
	const basename = path.basename(source)
	const extname = path.extname(source)
	const name = basename.slice(0, -extname.length)
	return { source, dirname, basename, name, extname }
}
