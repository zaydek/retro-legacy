import * as errors from "../errors"
import * as log from "../../shared/log"
import * as path from "path"
import * as T from "../types"
import * as utils from "../utils"

import { parse, ParsedPath } from "./parse"

export function dst_syntax(dirs: T.Directories, parsed: ParsedPath): string {
	const out = path.join(dirs.exportDir, parsed.src.slice(dirs.srcPagesDir.length))
	return out.slice(0, -parsed.ext.length) + ".html"
}

export function path_syntax(dirs: T.Directories, parsed: ParsedPath): string {
	const out = parsed.src.slice(dirs.srcPagesDir.length, -parsed.ext.length)
	if (out.endsWith("/index")) {
		return out.slice(0, -"index".length) // Keep "/"
	}
	return out
}

export function component_syntax(dirs: T.Directories, parsed: ParsedPath, { dynamic }: { dynamic: boolean }): string {
	let out = !dynamic ? "Static" : "Dynamic"
	const parts = path_syntax(dirs, parsed).split(path.sep)
	for (const part of parts) {
		const safe = part.replace(/[^a-zA-Z_0-9]+/g, "") // Remove unsafe characters
		if (safe.length === 0) continue
		out += safe[0]!.toUpperCase() + safe.slice(1)
	}
	out += parsed.name !== "index" ? "" : "Index"
	return out
}

export async function newPagesFromDirectories(dirs: T.Directories): Promise<T.FSPageInfo[]> {
	const srcs = await utils.readdirAll(dirs.srcPagesDir)

	// TODO: Add support for <Layout> components.
	const paths = srcs
		.map(src => parse(src))
		.filter(parsed => {
			if (/^[_$]|[_$]$/.test(parsed.name)) {
				return false
			}
			return /\.jsx?|tsx?$/.test(parsed.ext)
		})

	const badSrcs: string[] = []
	for (const parsed of paths) {
		if (!utils.testURISafe(parsed.src)) {
			badSrcs.push(parsed.src)
		}
	}

	if (badSrcs.length > 0) {
		log.error(errors.pagesUseNonURICharacters(badSrcs))
	}

	const pages: T.FSPageInfo[] = []
	for (const parsed of paths) {
		const syntax = path_syntax(dirs, parsed)
		if (/(\/)(\[)([a-zA-Z0-9\-\.\_\~\:\/\?\#\[\]\@\!\$\&\'\(\)\*\+\,\;\=]+)(\])/.test(syntax)) {
			pages.push({
				type: "dynamic",
				src: parsed.src,
				component: component_syntax(dirs, parsed, { dynamic: true }),
			})
		} else {
			pages.push({
				type: "static",
				src: parsed.src,
				component: component_syntax(dirs, parsed, { dynamic: false }),
			})
		}
	}
	return pages
}
