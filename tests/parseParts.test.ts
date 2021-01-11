import { parseParts } from "../router/parts"

test("integration", () => {
	expect(parseParts("")).toEqual(null)
	expect(parseParts("/")).toEqual(null)
	expect(parseParts("/hello")).toEqual([{ part: "hello", dynamic: false, nests: false }])
	expect(parseParts("/hello/")).toEqual([{ part: "hello", dynamic: false, nests: true }])
	expect(parseParts("/hello/world")).toEqual([
		{ part: "hello", dynamic: false, nests: true },
		{ part: "world", dynamic: false, nests: false },
	])
	expect(parseParts("/[hello]")).toEqual([{ part: "[hello]", dynamic: true, nests: false }])
	expect(parseParts("/[hello]/")).toEqual([{ part: "[hello]", dynamic: true, nests: true }])
	expect(parseParts("/[hello]/[world]")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: false },
	])
	expect(parseParts("/[hello]/[world]/")).toEqual([
		{ part: "[hello]", dynamic: true, nests: true },
		{ part: "[world]", dynamic: true, nests: true },
	])
})
