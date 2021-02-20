import * as utils from "../utils"

test("convertToPath", () => {
	expect(utils.convertToPath("")).toBe("")
	expect(utils.convertToPath("/")).toBe("/")
	expect(utils.convertToPath("/index")).toBe("/")
	expect(utils.convertToPath("/index.html")).toBe("/")
	expect(utils.convertToPath("/index.html.html")).toBe("/index.html")
})
