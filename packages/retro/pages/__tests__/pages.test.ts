import * as T from "../../types"

import { component_syntax, dst_syntax, path_syntax } from "../pages"
import { parse } from "../parse"

const dirs: T.Directories = {
	wwwDir: "www",
	srcPagesDir: "src/pages",
	cacheDir: "__cache__",
	exportDir: "__export__",
}

test("dst_syntax", () => {
	expect(dst_syntax(dirs, parse("src/pages/index.js"))).toBe("__export__/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo.js"))).toBe("__export__/foo.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/index.js"))).toBe("__export__/foo/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar.js"))).toBe("__export__/foo/bar.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/index.js"))).toBe("__export__/foo/bar/index.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/baz.js"))).toBe("__export__/foo/bar/baz.html")
	expect(dst_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"))).toBe("__export__/foo/bar/baz/index.html")
})

test("path_syntax", () => {
	expect(path_syntax(dirs, parse("src/pages/index.js"))).toBe("/")
	expect(path_syntax(dirs, parse("src/pages/foo.js"))).toBe("/foo")
	expect(path_syntax(dirs, parse("src/pages/foo/index.js"))).toBe("/foo/")
	expect(path_syntax(dirs, parse("src/pages/foo/bar.js"))).toBe("/foo/bar")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/index.js"))).toBe("/foo/bar/")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/baz.js"))).toBe("/foo/bar/baz")
	expect(path_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"))).toBe("/foo/bar/baz/")
})

test("component_syntax: dynamic=false", () => {
	const opt = { dynamic: false }
	expect(component_syntax(dirs, parse("src/pages/index.js"), opt)).toBe("StaticIndex")
	expect(component_syntax(dirs, parse("src/pages/foo.js"), opt)).toBe("StaticFoo")
	expect(component_syntax(dirs, parse("src/pages/foo/index.js"), opt)).toBe("StaticFooIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar.js"), opt)).toBe("StaticFooBar")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/index.js"), opt)).toBe("StaticFooBarIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz.js"), opt)).toBe("StaticFooBarBaz")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"), opt)).toBe("StaticFooBarBazIndex")
})

test("component_syntax: dynamic=true", () => {
	const opt = { dynamic: true }
	expect(component_syntax(dirs, parse("src/pages/index.js"), opt)).toBe("DynamicIndex")
	expect(component_syntax(dirs, parse("src/pages/foo.js"), opt)).toBe("DynamicFoo")
	expect(component_syntax(dirs, parse("src/pages/foo/index.js"), opt)).toBe("DynamicFooIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar.js"), opt)).toBe("DynamicFooBar")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/index.js"), opt)).toBe("DynamicFooBarIndex")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz.js"), opt)).toBe("DynamicFooBarBaz")
	expect(component_syntax(dirs, parse("src/pages/foo/bar/baz/index.js"), opt)).toBe("DynamicFooBarBazIndex")
})
