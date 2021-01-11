import parseDynamicPaths from "./parseDynamicPaths"

test("integration", () => {
	expect(parseDynamicPaths("")).toBe(null)
	expect(parseDynamicPaths("/")).toBe(null)
	expect(parseDynamicPaths("/hello")).toBe(null)
	expect(parseDynamicPaths("/hello/world")).toBe(null)
	expect(parseDynamicPaths("/[hello]")).toEqual([{ part: "[hello]", partName: "hello", nests: false }])
	expect(parseDynamicPaths("/[hello]/")).toEqual([{ part: "[hello]", partName: "hello", nests: true }])
	expect(parseDynamicPaths("/[hello]/[world]")).toEqual([
		{ part: "[hello]", partName: "hello", nests: true },
		{ part: "[world]", partName: "world", nests: false },
	])
	expect(parseDynamicPaths("/[hello]/[world]/")).toEqual([
		{ part: "[hello]", partName: "hello", nests: true },
		{ part: "[world]", partName: "world", nests: true },
	])
})
