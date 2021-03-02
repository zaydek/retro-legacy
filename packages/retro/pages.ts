import * as errors from "./errors"
import * as log from "../lib/log"
import * as path from "path"
import * as types from "./types"
import * as utils from "./utils"

const dynamicPathRegex = /(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/

// "src/pages/index.js" -> "/"
// "src/pages/page.js" -> "/page"
// "src/pages/nested/page.js" -> "/nested/page"
//
// TODO: Write tests.
function path_(dirs: types.Directories, pathInfo: utils.PathInfo): string {
	const out = pathInfo.src.slice(dirs.srcPagesDirectory.length, -pathInfo.ext.length)
	if (out.endsWith("/index")) {
		return out.slice(0, -"index".length)
	}
	return out
}

// src/pages/index.js -> __export__/index.html
// src/pages/page.js -> __export__/page.html
// src/pages/nested/page.js -> __export__/nested/page.html
//
// TODO: Write tests.
function dst(dirs: types.Directories, pathInfo: utils.PathInfo): string {
	const out = path.join(dirs.exportDirectory, pathInfo.src.slice(dirs.srcPagesDirectory.length))
	return out.slice(0, -pathInfo.ext.length) + ".html"
}

// src/pages/index.js -> StaticIndex
// src/pages/page.js -> StaticPage
// src/pages/nested/page.js -> StaticNestedPage
//
// TODO: Write tests.
function component(dirs: types.Directories, pathInfo: utils.PathInfo, { dynamic }: { dynamic: boolean }): string {
	let out = ""
	const parts = path_(dirs, pathInfo).split(path.sep)
	for (let part of parts) {
		if (part.startsWith("[") && part.endsWith("]")) {
			part = part.slice(1, -1) // Remove "[" and "]" syntax
		}
		if (part.length === 0) continue
		out += part[0]!.toUpperCase() + part.slice(1)
	}
	out =
		(!dynamic ? "Static" : "Dynamic") + // Prefix
		(out ?? "Index") // Suffix
	return out
}

// TODO: Write tests.
function newPageInfo(dirs: types.Directories, pathInfo: utils.PathInfo): types.StaticPageInfo {
	const out: types.StaticPageInfo = {
		type: "static",
		src: pathInfo.src,
		dst: dst(dirs, pathInfo),
		path: path_(dirs, pathInfo),
		component: component(dirs, pathInfo, { dynamic: false }),
	}
	return out
}

// TODO: Write tests.
function newDynamicPageInfo(dirs: types.Directories, pathInfo: utils.PathInfo): types.DynamicPageInfo {
	const out: types.DynamicPageInfo = {
		type: "dynamic",
		src: pathInfo.src,
		component: component(dirs, pathInfo, { dynamic: true }),
	}
	return out
}

const supportedExts: { [key: string]: boolean } = {
	".js": true,
	".jsx": true,
	".ts": true,
	".tsx": true,
	".md": true, // TODO
	".mdx": true, // TODO
}

export default async function parsePageInfosFromDirectories(dirs: types.Directories): Promise<types.PageInfo[]> {
	const srcs = await utils.readdirAll(dirs.srcPagesDirectory)

	// TODO: Add support for <Layout> components.
	const pathInfos = srcs
		.map(src => utils.parsePathInfo(src))
		.filter(pathInfo => {
			if (/^(_|$)|($|_)$/.test(pathInfo.name)) {
				return false
			}
			return supportedExts[pathInfo.ext] !== undefined
		})

	const badSrcs: string[] = []
	for (const pathInfo of pathInfos) {
		if (!utils.testURISafe(pathInfo.src)) {
			badSrcs.push(pathInfo.src)
		}
	}

	if (badSrcs.length > 0) {
		log.error(errors.pagesUseNonURICharacters(badSrcs))
	}

	const pages: types.PageInfo[] = []
	for (const pathInfo of pathInfos) {
		const syntax = path_(dirs, pathInfo)
		if (!dynamicPathRegex.test(syntax)) {
			pages.push(newPageInfo(dirs, pathInfo))
		} else {
			pages.push(newDynamicPageInfo(dirs, pathInfo))
		}
	}
	return pages
}
