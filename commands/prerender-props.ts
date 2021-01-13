import fs from "fs"
import path from "path"
import { getPageSrcs, serverGuards } from "./utils"

// TODO: Export to some a configuration module or map.
const PAGEDIR = "pages"

// prettier-ignore
//
// TODO: Prop keys can use the parts API to generate page-unique identifiers.
// This would enable esbuild to **not** import JSON payloads in-full.
interface PageProps {
	basename: string
	props:    any
}

type PagePropsMap = {
	[key: string]: PageProps
}

// Prerenders props on the server.
async function asyncRun() {
	serverGuards()

	const propPromises = []

	// Asynchronously prerender page props.
	const srcs = getPageSrcs()
	for (const each of srcs) {
		const promise = new Promise<PageProps>(async resolve => {
			const basename = path.parse(each).name

			const { load } = require("../" + PAGEDIR + "/" + each) // FIXME: Change `/` for COMPAT
			let props = null
			if (load) {
				props = await load()
			}
			resolve({ basename, props })
		})
		propPromises.push(promise)
	}

	// Array -> map:
	const propsArr = await Promise.all(propPromises)
	const propsMap = propsArr.reduce((acc, each) => {
		acc[each.basename] = each.props
		return acc
	}, {} as PagePropsMap)

	fs.writeFileSync("cache/props.generated.json", JSON.stringify(propsMap, null, "\t") + "\n")
}

;(async () => {
	await asyncRun()
})()
