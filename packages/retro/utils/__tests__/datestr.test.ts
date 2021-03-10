import { datestr } from "../datestr"

test("integration", () => {
	expect(datestr(new Date("2006-01-02T03:05:06.000"))).toBe("Jan 02 03:05:06.000 AM")
	expect(datestr(new Date("2006-01-02T15:05:06.000"))).toBe("Jan 02 03:05:06.000 PM")
})
