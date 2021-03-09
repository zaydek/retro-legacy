import * as validate from "./validate"

test("static module", () => {
	expect(validate.staticModuleExports({})).toBe(false)
	expect(validate.staticModuleExports({ default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ default: () => {} })).toBe(true)
	expect(validate.staticModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validate.staticModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ serverProps: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(
		validate.staticModuleExports({
			serverPaths: undefined,
			Head: undefined,
			default: undefined,
		}),
	).toBe(false)
})

test("dynamic module", () => {
	expect(validate.dynamicModuleExports({})).toBe(false)
	expect(validate.dynamicModuleExports({ default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ default: () => {} })).toBe(true)
	expect(validate.dynamicModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validate.dynamicModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ serverPaths: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(
		validate.dynamicModuleExports({
			serverProps: undefined,
			Head: undefined,
			default: undefined,
		}),
	).toBe(false)
})
