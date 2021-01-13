import { detab } from "./tabs"

test("integration", () => {
	expect(detab("")).toBe("")
	expect(detab("\t")).toBe("")
	expect(detab("\tHello, world!")).toBe("Hello, world!")
	expect(detab("\t\tHello, world!")).toBe("Hello, world!")
	expect(detab("\t\t\tHello, world!")).toBe("Hello, world!")
	expect(
		detab(`
Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
	Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
		Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
			Hello, world!
`),
	).toBe("Hello, world!\n")
	expect(
		detab(`
Hello, world!
Hello, world!
Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
	Hello, world!
	Hello, world!
	Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
		Hello, world!
		Hello, world!
		Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
			Hello, world!
			Hello, world!
			Hello, world!
`),
	).toBe("Hello, world!\nHello, world!\nHello, world!\n")
	expect(
		detab(`
Hello, world!
	Hello, world!
		Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
	Hello, world!
		Hello, world!
			Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
		Hello, world!
			Hello, world!
				Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
			Hello, world!
				Hello, world!
					Hello, world!
`),
	).toBe("Hello, world!\n\tHello, world!\n\t\tHello, world!\n")
	expect(
		detab(`
		Hello, world!
	Hello, world!
Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
			Hello, world!
		Hello, world!
	Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
				Hello, world!
			Hello, world!
		Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
	expect(
		detab(`
					Hello, world!
				Hello, world!
			Hello, world!
`),
	).toBe("\t\tHello, world!\n\tHello, world!\nHello, world!\n")
})
