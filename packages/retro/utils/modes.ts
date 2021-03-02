import * as path from "path"

// spaify converts a URL for SPA-mode.
//
// TODO: Write tests.
export function spaify(_: string): string {
	return "/"
}

// ssgify converts a URL for SSG-mode.
//
// TODO: Write tests.
export function ssgify(url: string): string {
	if (url.endsWith("/")) return url + "index.html"
	if (path.extname(url) === "") return url + ".html"
	return url
}
