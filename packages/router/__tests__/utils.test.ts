import * as utils from "../utils"

test("convPath", () => {
	expect(utils.convPath("")).toBe("")
	expect(utils.convPath("/")).toBe("/")
	expect(utils.convPath("/index")).toBe("/")
	expect(utils.convPath("/index.html")).toBe("/")
	expect(utils.convPath("/index.html.html")).toBe("/index.html")
})
