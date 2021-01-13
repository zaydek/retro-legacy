import conf from "./conf"
import fs from "fs"
import path from "path"
import { getPageSrcs, serverGuards } from "./utils"
import { parseRouteInfo } from "../Router/parts"

// prettier-ignore
interface PageProps {
	component: string
	props:     any
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
	for (const src of srcs) {
		const promise = new Promise<PageProps>(async resolve => {
			const basename = path.parse(src).name
			const routeInfo = parseRouteInfo("/" + basename)
			if (routeInfo === null) {
				throw new Error(`prerender-props: parseRouteInfo(${JSON.stringify(basename)})`)
			}

			const { load } = require("../" + conf.PAGES_DIR + "/" + src) // FIXME: Change `/` for COMPAT
			let props = null
			if (load) {
				props = await load()
			}
			resolve({ component: routeInfo.component, props })
		})
		propPromises.push(promise)
	}

	// Reduce from an array to a map:
	const propsArr = await Promise.all(propPromises)
	const propsMap = propsArr.reduce((acc, each) => {
		acc[each.component] = each.props
		return acc
	}, {} as PagePropsMap)

	fs.writeFileSync(conf.CACHE_DIR + "/props.generated.json", JSON.stringify(propsMap, null, "\t") + "\n")
}

;(async () => {
	await asyncRun()
})()
