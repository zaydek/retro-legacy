import * as fs from "fs"
import * as pages from "../pages"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"

export async function resolveTemplate(this: T.Runtime): Promise<void> {
	const buffer = await fs.promises.readFile(path.join(this.dirs.wwwDir, "index.html"))
	const contents = buffer.toString()
	this.tmpl = contents
}

export async function resolveFSPages(this: T.Runtime): Promise<void> {
	this.pages = await pages.newPagesFromDirectories(this.dirs)
}

export async function resolveServerRouter(this: T.Runtime): Promise<void> {
	this.router = await router.newRouterFromRuntime(this)
}
