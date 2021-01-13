import fs from "fs"
import path from "path"

const PAGEDIR = "pages"

const routeFiletypes = ["js", "jsx", "ts", "tsx", "md", "mdx"]

function isFile(src: string) {
	// TODO: Change `"/"` to support more OSs.
	return fs.statSync(PAGEDIR + "/" + src).isFile()
}

function isRouterFiletype(src: string) {
	return routeFiletypes.some(each => src.endsWith("." + each))
}

// TODO: Change to support Perl-style alphabetics?
//
// prettier-ignore
function isHiddenFile(src: string) {
	const ok = (
		!/^[a-zA-Z0-9]/.test(src) ||
		src.includes(".TODO.") ||
		src.includes(".DRAFT.")
	)
	return ok
}

// prettier-ignore
export default function getPages() {
	const srcs = fs.readdirSync("pages").filter(each => {
		const ok = (
			isFile(each) &&
			isRouterFiletype(each) &&
			!isHiddenFile(each)
		)
		return ok
	})
	const pages = srcs.map(each => path.parse(each).name)
	return pages
}
