import { parseDynamicPaths } from "./parseDynamicPaths"

test("integration", () => {
	expect(parseDynamicPaths("")).toEqual(null)
	expect(parseDynamicPaths("/")).toEqual(null)
	expect(parseDynamicPaths("/hello")).toEqual([{ part: "hello", dynamic: false, nests: false }])
	expect(parseDynamicPaths("/hello/")).toEqual([{ part: "hello", dynamic: false, nests: true }])
	expect(parseDynamicPaths("/hello/world")).toEqual([
		{ part: "hello", dynamic: false, nests: true },
		{ part: "world", dynamic: false, nests: false },
	])
	expect(parseDynamicPaths("/[hello]")).toEqual([{ part: "[hello]", dynamic: true, nests: false }])
	expect(parseDynamicPaths("/[hello]/")).toEqual([{ part: "[hello]", dynamic: true, nests: true }])
	expect(parseDynamicPaths("/[hello]/[world]")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: false },
	])
	expect(parseDynamicPaths("/[hello]/[world]/")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: true },
	])
})
