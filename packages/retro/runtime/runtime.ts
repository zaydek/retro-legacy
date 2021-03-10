import * as T from "../types"

import { purgeDirs, serverGuards } from "./helpers"
import { resolvePages, resolveRouter, resolveTemplate } from "./resolvers"

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
		async serverGuards(): Promise<void> {
			await serverGuards.apply(this)
		},
		async purgeDirs(): Promise<void> {
			await purgeDirs.apply(this)
		},
		async resolveTemplate(): Promise<void> {
			await resolveTemplate.apply(this)
		},
		async resolveFSPages(): Promise<void> {
			await resolvePages.apply(this)
		},
		async resolveServerRouter(): Promise<void> {
			await resolveRouter.apply(this)
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
