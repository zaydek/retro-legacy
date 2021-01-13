import compareParts from "./compareParts"
import parse from "./parseParts"

// prettier-ignore
test("integration", () => {
	expect(compareParts(
		parse("/hello")!,
		parse("/hello")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello")!,
		parse("/hello/")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/")!,
		parse("/hello")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/")!,
		parse("/hello/")!),
	).toBe(true)

	expect(compareParts(
		parse("/hello/world")!,
		parse("/hello/world")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/hello/world/")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/hello/world")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/hello/world/")!),
	).toBe(true)

	expect(compareParts(
		parse("/hello")!,
		parse("/[hello]")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/")!,
		parse("/[hello]")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello")!,
		parse("/[hello]/")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/")!,
		parse("/[hello]/")!),
	).toBe(true)

	expect(compareParts(
		parse("/hello/world")!,
		parse("/hello/[world]")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/hello/[world]")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/hello/[world]/")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/hello/[world]/")!),
	).toBe(true)

	expect(compareParts(
		parse("/hello/world")!,
		parse("/[hello]/[world]")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/[hello]/[world]")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/[hello]/[world]/")!),
	).toBe(false)
	expect(compareParts(
		parse("/hello/world/")!,
		parse("/[hello]/[world]/")!),
	).toBe(true)

	expect(compareParts(
		parse("/hello/world")!,
		parse("/[hello]/world")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/[hello]/[world]")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/hello/[world]")!),
	).toBe(true)
	expect(compareParts(
		parse("/hello/world")!,
		parse("/[hello]/[world]")!),
	).toBe(true)
})
