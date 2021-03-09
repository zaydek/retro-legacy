import * as validate from "./validate"

test("static module exports", () => {
	expect(validate.staticModuleExports({})).toBe(false)
	expect(validate.staticModuleExports({ default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ default: () => {} })).toBe(true)
	expect(validate.staticModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validate.staticModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validate.staticModuleExports({ serverProps: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(validate.staticModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
})

test("dynamic module exports", () => {
	expect(validate.dynamicModuleExports({})).toBe(false)
	expect(validate.dynamicModuleExports({ default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ default: () => {} })).toBe(true)
	expect(validate.dynamicModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validate.dynamicModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validate.dynamicModuleExports({ serverPaths: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(validate.dynamicModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
})

////////////////////////////////////////////////////////////////////////////////

test("serverProps return", () => {
	expect(validate.serverPropsReturn(undefined)).toBe(false)
	expect(validate.serverPropsReturn({})).toBe(true)
	expect(validate.serverPropsReturn({ foo: "bar" })).toBe(true)
})

test("serverPaths return", () => {
	expect(validate.serverPathsReturn(undefined)).toBe(false)
	expect(validate.serverPathsReturn([])).toBe(false)
	expect(validate.serverPathsReturn([{ path: "/foo/bar" }])).toBe(false)
	expect(validate.serverPathsReturn([{ path: "/foo/bar", props: undefined }])).toBe(false)
	expect(validate.serverPathsReturn([{ path: "/foo/bar", props: { foo: "bar" } }])).toBe(true)
})
