import * as fs from "fs"
import * as pages from "../pages"
import * as path from "path"
import * as router from "../router"
import * as T from "../types"

// resolveTemplate resolves this.template.
export async function resolveTemplate(this: T.Runtime): Promise<void> {
	const buffer = await fs.promises.readFile(path.join(this.dirs.wwwDir, "index.html"))
	const contents = buffer.toString()
	this.tmpl = contents
}

// resolvePages resolves this.pages.
export async function resolvePages(this: T.Runtime): Promise<void> {
	this.pages = await pages.newPagesFromDirectories(this.dirs)
}

// resolveRouter resolves this.router.
export async function resolveRouter(this: T.Runtime): Promise<void> {
	this.router = await router.newRouterFromRuntime(this)
}
