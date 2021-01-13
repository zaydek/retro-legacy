import conf from "../conf"
import fs from "fs"

function isFile(src: string) {
	return fs.statSync(conf.PAGES_DIR + "/" + src).isFile() // FIXME: Change `/` for COMPAT
}

function isRouterFiletype(src: string) {
	return /\.(jsx?|tsx?|mdx?)$/.test(src)
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
