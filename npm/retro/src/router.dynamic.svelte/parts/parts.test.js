const { validRegexp, parseParts, compareParts, parseParams } = require("./parts.js")

test("validRegexp: non-dynamic", () => {
	expect(validRegexp.test("/")).toBe(true)
	expect(validRegexp.test("/hello")).toBe(true)
	expect(validRegexp.test("/hello/")).toBe(true)
	expect(validRegexp.test("/hello/world")).toBe(true)
	expect(validRegexp.test("/hello/world/")).toBe(true)
})

test("validRegexp: dynamic", () => {
	expect(validRegexp.test("/[hello]")).toBe(true)
	expect(validRegexp.test("/[hello]/")).toBe(true)
	expect(validRegexp.test("/[hello]/[world]")).toBe(true)
	expect(validRegexp.test("/[hello]/[world]/")).toBe(true)
})

test("parts_parts: non-dynamic", () => {
	expect(parseParts("/hello")).toEqual([{ id: "hello", dynamic: false, nests: false }])
	expect(parseParts("/hello/")).toEqual([{ id: "hello", dynamic: false, nests: true }])
	expect(parseParts("/hello/world")).toEqual([
		{ id: "hello", dynamic: false, nests: true },
		{ id: "world", dynamic: false, nests: false },
	])
	expect(parseParts("/hello/world/")).toEqual([
		{ id: "hello", dynamic: false, nests: true },
		{ id: "world", dynamic: false, nests: true },
	])
})

test("parts_parts: dynamic", () => {
	expect(parseParts("/[hello]")).toEqual([{ id: "hello", dynamic: true, nests: false }])
	expect(parseParts("/[hello]/")).toEqual([{ id: "hello", dynamic: true, nests: true }])
	expect(parseParts("/[hello]/[world]")).toEqual([
		{ id: "hello", dynamic: true, nests: true },
		{ id: "world", dynamic: true, nests: false },
	])
	expect(parseParts("/[hello]/[world]/")).toEqual([
		{ id: "hello", dynamic: true, nests: true },
		{ id: "world", dynamic: true, nests: true },
	])
})

test("compareParts: strict=false", () => {
	expect(compareParts(parseParts("/hello"), parseParts("/hello"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/"), parseParts("/hello"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello"), parseParts("/hello/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/"), parseParts("/hello/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]"), parseParts("/hello"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/"), parseParts("/hello"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]"), parseParts("/hello/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/"), parseParts("/hello/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/world"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/world/"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/world"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/world/"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world/"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world/"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]/"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]/"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]/"), parseParts("/hello/world"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]"), parseParts("/hello/world/"), { strict: false })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]/"), parseParts("/hello/world/"), { strict: false })).toBe(true)
})

test("compareParts: strict=true", () => {
	expect(compareParts(parseParts("/hello"), parseParts("/hello"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/hello/"), parseParts("/hello"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello"), parseParts("/hello/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello/"), parseParts("/hello/"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]"), parseParts("/hello"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]/"), parseParts("/hello"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]"), parseParts("/hello/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]/"), parseParts("/hello/"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/hello/world"), parseParts("/hello/world"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/hello/world/"), parseParts("/hello/world"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello/world"), parseParts("/hello/world/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello/world/"), parseParts("/hello/world/"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world"), parseParts("/hello/world"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]/world/"), parseParts("/hello/world"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]/world"), parseParts("/hello/world/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]/world/"), parseParts("/hello/world/"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]"), parseParts("/hello/world"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/hello/[world]/"), parseParts("/hello/world"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello/[world]"), parseParts("/hello/world/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/hello/[world]/"), parseParts("/hello/world/"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]"), parseParts("/hello/world"), { strict: true })).toBe(true)
	expect(compareParts(parseParts("/[hello]/[world]/"), parseParts("/hello/world"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]/[world]"), parseParts("/hello/world/"), { strict: true })).toBe(false)
	expect(compareParts(parseParts("/[hello]/[world]/"), parseParts("/hello/world/"), { strict: true })).toBe(true)
})

test("parseParams", () => {
	expect(parseParams(parseParts("/"), parseParts("/"))).toEqual({})
	expect(parseParams(parseParts("/foo"), parseParts("/"))).toEqual(null)
	expect(parseParams(parseParts("/"), parseParts("/foo"))).toEqual(null)
	expect(parseParams(parseParts("/foo"), parseParts("/foo"))).toEqual({})
	expect(parseParams(parseParts("/[foo]"), parseParts("/a"))).toEqual({ foo: "a" })
	expect(parseParams(parseParts("/[foo]/[bar]"), parseParts("/a/b"))).toEqual({ foo: "a", bar: "b" })
	expect(parseParams(parseParts("/[foo]/[bar]/[baz]"), parseParts("/a/b/c"))).toEqual({
		foo: "a",
		bar: "b",
		baz: "c",
	})
})
