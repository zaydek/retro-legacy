import { parse } from "../pages"

// prettier-ignore
test("parse: absolute", () => {
	expect(parse("")).toEqual({ src: "", dirname: ".", basename: "", name: "", extname: "" })
	expect(parse("/")).toEqual({ src: "/", dirname: "/", basename: "", name: "", extname: "" })
	expect(parse("/foo")).toEqual({ src: "/foo", dirname: "/", basename: "foo", name: "", extname: "" })
	expect(parse("/foo/bar")).toEqual({ src: "/foo/bar", dirname: "/foo", basename: "bar", name: "", extname: "" })
	expect(parse("/foo/bar.baz")).toEqual({ src: "/foo/bar.baz", dirname: "/foo", basename: "bar.baz", name: "bar", extname: ".baz" })
})

// prettier-ignore
test("parse: relative", () => {
	expect(parse("")).toEqual({ src: "", dirname: ".", basename: "", name: "", extname: "" })
	expect(parse("foo")).toEqual({ src: "foo", dirname: ".", basename: "foo", name: "", extname: "" })
	expect(parse("foo/bar")).toEqual({ src: "foo/bar", dirname: "foo", basename: "bar", name: "", extname: "" })
	expect(parse("foo/bar.baz")).toEqual({ src: "foo/bar.baz", dirname: "foo", basename: "bar.baz", name: "bar", extname: ".baz" })
})
