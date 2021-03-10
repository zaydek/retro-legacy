import { parse } from "../parse"

test("parse: absolute", () => {
	expect(parse("/")).toEqual({ src: "/", basename: "", name: "", ext: "" })
	expect(parse("/foo")).toEqual({ src: "/foo", basename: "foo", name: "", ext: "" })
	expect(parse("/foo/bar")).toEqual({ src: "/foo/bar", basename: "bar", name: "", ext: "" })
	expect(parse("/foo/bar.baz")).toEqual({ src: "/foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})

test("parse: relative", () => {
	expect(parse("")).toEqual({ src: "", basename: "", name: "", ext: "" })
	expect(parse("foo")).toEqual({ src: "foo", basename: "foo", name: "", ext: "" })
	expect(parse("foo/bar")).toEqual({ src: "foo/bar", basename: "bar", name: "", ext: "" })
	expect(parse("foo/bar.baz")).toEqual({ src: "foo/bar.baz", basename: "bar.baz", name: "bar", ext: ".baz" })
})
