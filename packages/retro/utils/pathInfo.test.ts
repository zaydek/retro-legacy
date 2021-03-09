import { parsePathInfo } from "./pathInfo"

test("absolute", () => {
	expect(parsePathInfo("/")).toEqual({ src: "/", basename: "", name: "", ext: "" })
	expect(parsePathInfo("/foo")).toEqual({ src: "/foo", basename: "foo", name: "", ext: "" })
	expect(parsePathInfo("/foo/bar")).toEqual({ src: "/foo/bar", basename: "bar", name: "", ext: "" })
	expect(parsePathInfo("/foo/bar.baz")).toEqual({ src: "/foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})

test("relative", () => {
	expect(parsePathInfo("")).toEqual({ src: "", basename: "", name: "", ext: "" })
	expect(parsePathInfo("foo")).toEqual({ src: "foo", basename: "foo", name: "", ext: "" })
	expect(parsePathInfo("foo/bar")).toEqual({ src: "foo/bar", basename: "bar", name: "", ext: "" })
	expect(parsePathInfo("foo/bar.baz")).toEqual({ src: "foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})
