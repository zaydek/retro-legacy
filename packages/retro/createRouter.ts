import * as fs from "fs"
import * as p from "path"
import * as types from "./types"

// prettier-ignore
interface StaticRoute {
	srcPath:   string // e.g. "src/pages/index.js"
	dstPath:   string // e.g. "dst/index.html"
	component: string // e.g. "PageIndex"
	path:      string // e.g. "/"
}

// prettier-ignore
interface PathMetadata {
	path:     string // e.g. "path/to/basename.ext"
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

// parsePathMetadata parses path metadata.
function parsePathMetadata(path: string): PathMetadata {
	const basename = p.basename(path)
	const ext = p.extname(path)
	const name = basename.slice(0, -ext.length)
	return { path, basename, name, ext }
}

// src/pages/index.js -> __export__/index.html
// TODO: Write tests.
function dstPath(runtime: types.Runtime<types.Command>, path: PathMetadata): string {
	const syntax = p.join(runtime.dir.exportDir, path.path.slice(runtime.dir.srcPagesDir.length))
	return syntax.slice(0, -path.ext.length) + ".html"
}

// "src/pages/component.js" -> "Component"
// TODO: Write tests.
function component(path: PathMetadata): string {
	const { name } = path

	let syntax = ""
	for (let x = 0; x < name.length; x++) {
		switch (name[x]) {
			case "/":
				x++
				while (x < name.length) {
					if (name[x] !== "/") {
						// No-op
						break
					}
					x++
				}
				if (x < name.length) {
					syntax += name[x]!.toUpperCase()
				}
				break
			case "-":
				x++
				while (x < name.length) {
					if (name[x] !== "/") {
						// No-op
						break
					}
					x++
				}
				if (x < name.length) {
					syntax += name[x]!.toUpperCase()
				}
				break
			default:
				syntax += name[x]
				break
		}
	}
	syntax = "Page" + syntax[0]!.toUpperCase() + syntax.slice(1)
	return syntax
}

// "src/pages/index.js" -> "/"
// "src/pages/hello-world.js" -> "/hello-world"
// TODO: Write tests.
function path_(runtime: types.Runtime<types.Command>, path: PathMetadata): string {
	const syntax = path.path.slice(runtime.dir.srcPagesDir.length, -path.ext.length)
	if (syntax.endsWith("/index")) {
		// "/" case:
		return syntax.slice(0, -"index".length)
	}
	// "/hello-world" case:
	return syntax
}

// parseRoute parses a new filesystem route.
// TODO: Write tests.
function parseRoute(runtime: types.Runtime<types.Command>, path: PathMetadata): StaticRoute {
	const route: StaticRoute = {
		srcPath: path.path,
		dstPath: dstPath(runtime, path),
		component: component(path),
		path: path_(runtime, path),
	}
	return route
}

async function readPaths(dir: string): Promise<PathMetadata[]> {
	const paths: PathMetadata[] = []
	async function recurse(dir: string): Promise<void> {
		const ls = await fs.promises.readdir(dir)
		for (const each of ls) {
			const current = p.join(dir, each)
			if ((await fs.promises.stat(current)).isDirectory()) {
				paths.push(parsePathMetadata(current))
				await recurse(current) // Recurse on the current directory
				continue
			}
			paths.push(parsePathMetadata(current))
		}
	}
	await recurse(dir)
	return paths
}

// createRouter creates a route from src/pages.
export default async function createRouter(runtime: types.Runtime<types.Command>): Promise<StaticRoute[]> {
	const paths = await readPaths("src")
	const subpaths = paths.filter(path => {
		if (path.name.startsWith("_") || path.name.startsWith("$") || path.name.endsWith("_") || path.name.endsWith("$")) {
			return false
		}
		return supported[path.ext]
	})
	const router: StaticRoute[] = []
	for (const path of subpaths) {
		router.push(parseRoute(runtime, path))
	}
	return router
}
