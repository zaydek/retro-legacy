import parse from "./parseParts"

test("integration", () => {
	expect(parse("")).toEqual(null)
	expect(parse("/")).toEqual(null)
	expect(parse("/hello")).toEqual([{ part: "hello", dynamic: false, nests: false }])
	expect(parse("/hello/")).toEqual([{ part: "hello", dynamic: false, nests: true }])
	expect(parse("/hello/world")).toEqual([
		{ part: "hello", dynamic: false, nests: true },
		{ part: "world", dynamic: false, nests: false },
	])
	expect(parse("/[hello]")).toEqual([{ part: "[hello]", dynamic: true, nests: false }])
	expect(parse("/[hello]/")).toEqual([{ part: "[hello]", dynamic: true, nests: true }])
	expect(parse("/[hello]/[world]")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: false },
	])
	expect(parse("/[hello]/[world]/")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: true },
	])
})
