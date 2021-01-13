import fs from "fs"

// TODO: Export to some a configuration module or map.
const PAGEDIR = "pages"

const routeFileTypesRegex = /\.(jsx?|tsx?|mdx?)$/

function isFile(src: string) {
	return fs.statSync(PAGEDIR + "/" + src).isFile() // FIXME: Change `/` for COMPAT
}

function isRouterFiletype(src: string) {
	return routeFileTypesRegex.test(src)
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
export default function getPagesSrcs() {
	const srcs = fs.readdirSync("pages").filter(each => {
		const ok = (
			isFile(each) &&
			isRouterFiletype(each) &&
			!isHiddenFile(each)
		)
		return ok
	})
	return srcs
}
