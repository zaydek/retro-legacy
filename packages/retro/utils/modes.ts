import * as p from "path"

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
	if (p.extname(url) === "") return url + ".html"
	return url
}
