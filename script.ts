import * as fs from "fs"
import * as p from "path"

// /\.(js|ts|md)x?$/
const supported: { [key: string]: boolean } = {
	".js": true,
	".jsx": true,
	".ts": true,
	".tsx": true,
	".md": true,
	".mdx": true,
}

// FilesystemRoute describes a filesystem route (serverProps and serverPaths are
// not yet resolved on the server).
interface FilesystemRoute {
	srcPath: string
	dstPath: string
	component: string
	path: string
}

interface PathMetadata {
	basename: string
	ext: string
	name: string
}

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
		// "/"
		return syntax.slice(0, -"index".length)
	}
	// "/hello-world"
	return syntax
}

// parseStaticRoute parses a new filesystem route.
function parseStaticRoute(runtime: Runtime, path: string): FilesystemRoute {
	const route: FilesystemRoute = {
		srcPath: path,
		dstPath: dstPath(runtime, path),
		component: component(path),
		path: path_(runtime, path),
	}
	return route
}

// ls lists paths recursively.
async function ls(dir: string): Promise<string[]> {
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

	const paths = await ls("src")
	const filtered = paths.filter(path => {
		const { name, ext } = parsePath(path)
		if (name.startsWith("_") || name.startsWith("$") || name.endsWith("_") || name.endsWith("$")) {
			return false
		}
		return supported[ext]
	})

	const staticRouter: FilesystemRoute[] = []
	for (const path of filtered) {
		staticRouter.push(parseStaticRoute(runtime, path))
	}
	console.log(staticRouter)
})()
