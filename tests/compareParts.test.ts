import { compareParts, parseParts as p } from "../router/parts"

test("integration", () => {
	expect(compareParts(p("/hello")!, p("/hello")!)).toBe(true)
	expect(compareParts(p("/hello")!, p("/hello/")!)).toBe(false)
	expect(compareParts(p("/hello/")!, p("/hello")!)).toBe(false)
	expect(compareParts(p("/hello/")!, p("/hello/")!)).toBe(true)

	expect(compareParts(p("/hello/world")!, p("/hello/world")!)).toBe(true)
	expect(compareParts(p("/hello/world")!, p("/hello/world/")!)).toBe(false)
	expect(compareParts(p("/hello/world/")!, p("/hello/world")!)).toBe(false)
	expect(compareParts(p("/hello/world/")!, p("/hello/world/")!)).toBe(true)

	expect(compareParts(p("/hello")!, p("/[hello]")!)).toBe(true)
	expect(compareParts(p("/hello/")!, p("/[hello]")!)).toBe(false)
	expect(compareParts(p("/hello")!, p("/[hello]/")!)).toBe(false)
	expect(compareParts(p("/hello/")!, p("/[hello]/")!)).toBe(true)

	expect(compareParts(p("/hello/world")!, p("/hello/[world]")!)).toBe(true)
	expect(compareParts(p("/hello/world/")!, p("/hello/[world]")!)).toBe(false)
	expect(compareParts(p("/hello/world")!, p("/hello/[world]/")!)).toBe(false)
	expect(compareParts(p("/hello/world/")!, p("/hello/[world]/")!)).toBe(true)

	expect(compareParts(p("/hello/world")!, p("/[hello]/[world]")!)).toBe(true)
	expect(compareParts(p("/hello/world/")!, p("/[hello]/[world]")!)).toBe(false)
	expect(compareParts(p("/hello/world")!, p("/[hello]/[world]/")!)).toBe(false)
	expect(compareParts(p("/hello/world/")!, p("/[hello]/[world]/")!)).toBe(true)

	expect(compareParts(p("/hello/world")!, p("/[hello]/world")!)).toBe(true)
	expect(compareParts(p("/hello/world")!, p("/[hello]/[world]")!)).toBe(true)
	expect(compareParts(p("/hello/world")!, p("/hello/[world]")!)).toBe(true)
	expect(compareParts(p("/hello/world")!, p("/[hello]/[world]")!)).toBe(true)
})
