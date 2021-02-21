import * as fs from "fs"
import * as p from "path"

// prettier-ignore
interface StaticRouter {
	srcPath:   string // e.g. "src/pages/index.js"
	dstPath:   string // e.g. "dst/index.html"
	component: string // e.g. "PageIndex"
	path:      string // e.g. "/"
}

// prettier-ignore
interface PathMetadata {
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

// parsePath parses path metadata.
function parsePath(path: string): PathMetadata {
	const basename = p.basename(path)
	const ext = p.extname(path)
	const name = basename.slice(0, -ext.length)
	return { basename, ext, name }
}

// src/pages/index.js -> __export__/index.html
function dstPath(runtime: Runtime, path: string): string {
	const { ext } = parsePath(path)

	const syntax = p.join(runtime.dir.exportDir, path.slice(runtime.dir.srcPagesDir.length))
	return syntax.slice(0, -ext.length) + ".html"
}

// "src/pages/component.js" -> "Component"
function component(path: string): string {
	const { name } = parsePath(path)

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
				// if (x < name.length) {
				syntax += name[x]!.toUpperCase()
				// }
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
				// if (x < name.length) {
				syntax += name[x]!.toUpperCase()
				// }
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
function path_(runtime: Runtime, path: string): string {
	const { ext } = parsePath(path)
	const syntax = path.slice(runtime.dir.srcPagesDir.length, -ext.length)
	if (syntax.endsWith("/index")) {
		// "/" case:
		return syntax.slice(0, -"index".length)
	}
	// "/hello-world" case:
	return syntax
}

// parseStaticRoute parses a new filesystem route.
function parseStaticRoute(runtime: Runtime, path: string): StaticRouter {
	const route: StaticRouter = {
		srcPath: path,
		dstPath: dstPath(runtime, path),
		component: component(path),
		path: path_(runtime, path),
	}
	return route
}

async function readdirRecursive(dir: string): Promise<string[]> {
	const paths: string[] = []
	const recurse = async (dir: string): Promise<void> => {
		const ls = await fs.promises.readdir(dir)
		for (const each of ls) {
			const current = p.join(dir, each)
			if ((await fs.promises.stat(current)).isDirectory()) {
				paths.push(current)
				await recurse(current) // Recurse on the current directory
				continue
			}
			paths.push(current)
		}
	}
	await recurse(dir)
	return paths
}

// prettier-ignore
const DIRS = {
	publicDir:   "public",
	srcPagesDir: "src/pages",
	cacheDir:    "__cache__",
	exportDir:   "__export__",
}

// prettier-ignore
interface Runtime {
	dir: typeof DIRS
}

;(async (): Promise<void> => {
	const runtime = {
		dir: DIRS,
	}

	const paths = await readdirRecursive("src")
	const filtered = paths.filter(path => {
		const { name, ext } = parsePath(path)
		if (name.startsWith("_") || name.startsWith("$") || name.endsWith("_") || name.endsWith("$")) {
			return false
		}
		return supported[ext]
	})

	const staticRouter: StaticRouter[] = []
	for (const path of filtered) {
		staticRouter.push(parseStaticRoute(runtime, path))
	}
	console.log(staticRouter)
})()
