import * as T from "../types"

import { purgeDirs, serverGuards } from "./helpers"
import { resolveFSPages, resolveServerRouter, resolveTemplate } from "./resolvers"

export async function newRuntimeFromCommand(cmd: T.AnyCommand): Promise<T.Runtime<typeof cmd>> {
	const runtime: T.Runtime<typeof cmd> = {
		// State
		cmd,
		dirs: {
			wwwDir: "www",
			srcPagesDir: "src/pages",
			cacheDir: "__cache__",
			exportDir: "__export__",
		},
		tmpl: "",
		pages: [],
		router: {},

		// Methods
		async purgeDirs() {
			await purgeDirs.apply(this)
		},
		async serverGuards() {
			await serverGuards.apply(this)
		},
		async resolveTemplate() {
			await resolveTemplate.apply(this)
		},
		async resolveFSPages() {
			await resolveFSPages.apply(this)
		},
		async resolveServerRouter() {
			await resolveServerRouter.apply(this)
		},
	}

	if (runtime.cmd.type === "serve") return runtime

	await runtime.purgeDirs() // TODO
	await runtime.serverGuards()
	await runtime.resolveTemplate()
	await runtime.resolveFSPages()
	await runtime.resolveServerRouter()

	return runtime
}
