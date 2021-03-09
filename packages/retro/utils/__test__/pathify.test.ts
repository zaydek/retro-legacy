import { spaify, ssgify } from "./pathify"

test("spaify", () => {
	expect(spaify("/")).toBe("/")
	expect(spaify("/index")).toBe("/")
	expect(spaify("/index.html")).toBe("/")
	expect(spaify("/path/index.html")).toBe("/")
	expect(spaify("/path/to/index.html")).toBe("/")

	expect(spaify("/foo")).toBe("/")
	expect(spaify("/foo/bar")).toBe("/")
	expect(spaify("/foo/bar.baz")).toBe("/")
})

test("ssgify", () => {
	expect(ssgify("/")).toBe("/index.html")
	expect(ssgify("/index")).toBe("/index.html")
	expect(ssgify("/index.html")).toBe("/index.html")
	expect(ssgify("/path/index.html")).toBe("/path/index.html")
	expect(ssgify("/path/to/index.html")).toBe("/path/to/index.html")

	expect(ssgify("/foo")).toBe("/foo.html")
	expect(ssgify("/foo/bar")).toBe("/foo/bar.html")
	expect(ssgify("/foo/bar.baz")).toBe("/foo/bar.baz")
})
