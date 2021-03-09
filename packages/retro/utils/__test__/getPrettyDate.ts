import { getPrettyDate } from "../getPrettyDate"

test("integration", () => {
	expect(getPrettyDate(new Date("2006-01-02T03:05:06.000"))).toBe("03:05:06.000 AM")
	expect(getPrettyDate(new Date("2006-01-02T15:05:06.000"))).toBe("03:05:06.000 PM")
})
