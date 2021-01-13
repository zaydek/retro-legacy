import parseParts from "./parseParts"
import { RouteInfo } from "./types"
import { toTitleCase } from "../../utils"

// Ex:
//
// [hello]/[world]
//
// -> {
// ->   page: "PageDynamicHelloSlashDynamicWorld",
// ->   component: "PageDynamicXSlashDynamicYSlashDynamicZ",
// -> }
//
export default function parseRouteInfo(partsStr: string) {
	const parts = parseParts(partsStr)
	if (!parts) {
		return null
	}
	const componentStr = parts
		.map(each => {
			let str = ""
			if (each.dynamic) {
				str += "Dynamic"
			}
			str += toTitleCase(!each.dynamic ? each.part : each.part.slice(1, -1))
			if (each.nests) {
				str += "Slash"
			}
			return str
		})
		.join("")
	const info: RouteInfo = {
		page: partsStr,
		component: "Page" + componentStr,
	}
	return info
}
