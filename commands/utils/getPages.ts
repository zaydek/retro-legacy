import fs from "fs"

// // Gets pages as names.
// function getPageSrcs() {
// 	const paths = fs.readdirSync("./router")
//
// 	// prettier-ignore
// 	const srcs = paths.filter(each => {
// 		const ok = (
// 			fs.statSync("./router/" + each).isFile() &&
// 			path.parse("./router/" + each).ext === ".tsx" &&
// 			!each.startsWith("_") &&
// 			each !== "App.tsx" // TODO
// 		)
// 		return ok
// 	})
// 	const pages = srcs.map(each => path.parse(each).name)
// 	return pages
// }
//

// TODO: Negate `*.TODO.*` and `*.DRAFT.*`.
export default function getPages() {
	// prettier-ignore
	const srcs = fs.readdirSync("pages").filter((each: string) => {
		const ok = (
			!each.startsWith("_document") &&
			each.endsWith(".tsx")
		)
		return ok
	})
	return srcs
}
