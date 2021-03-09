import * as pathInfo from "./pathInfo"

test("absolute", () => {
	expect(pathInfo.parsePathInfo("/")).toEqual({ src: "/", basename: "", name: "", ext: "" })
	expect(pathInfo.parsePathInfo("/foo")).toEqual({ src: "/foo", basename: "foo", name: "", ext: "" })
	expect(pathInfo.parsePathInfo("/foo/bar")).toEqual({ src: "/foo/bar", basename: "bar", name: "", ext: "" })

	// prettier-ignore
	expect(pathInfo.parsePathInfo("/foo/bar.baz")).toEqual({ src: "/foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})

test("relative", () => {
	expect(pathInfo.parsePathInfo("")).toEqual({ src: "", basename: "", name: "", ext: "" })
	expect(pathInfo.parsePathInfo("foo")).toEqual({ src: "foo", basename: "foo", name: "", ext: "" })
	expect(pathInfo.parsePathInfo("foo/bar")).toEqual({ src: "foo/bar", basename: "bar", name: "", ext: "" })

	// prettier-ignore
	expect(pathInfo.parsePathInfo("foo/bar.baz")).toEqual({ src: "foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})
