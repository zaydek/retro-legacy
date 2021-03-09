import * as path from "path"

export function spaify(_: string): string {
	return "/"
}

export function ssgify(url: string): string {
	if (url.endsWith("/")) return url + "index.html"
	if (path.extname(url) === "") return url + ".html"
	return url
}
