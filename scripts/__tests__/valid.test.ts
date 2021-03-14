import * as valid from "../valid"

test("static module exports", () => {
	expect(valid.staticModuleExports({})).toBe(false)
	expect(valid.staticModuleExports({ default: undefined })).toBe(false)
	expect(valid.staticModuleExports({ default: () => {} })).toBe(true)
	expect(valid.staticModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(valid.staticModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(valid.staticModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(valid.staticModuleExports({ serverProps: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(valid.staticModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
})

test("dynamic module exports", () => {
	expect(valid.dynamicModuleExports({})).toBe(false)
	expect(valid.dynamicModuleExports({ default: undefined })).toBe(false)
	expect(valid.dynamicModuleExports({ default: () => {} })).toBe(true)
	expect(valid.dynamicModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(valid.dynamicModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(valid.dynamicModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(valid.dynamicModuleExports({ serverPaths: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(valid.dynamicModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
})

////////////////////////////////////////////////////////////////////////////////

test("serverProps return", () => {
	expect(valid.serverPropsReturn(undefined)).toBe(false)
	expect(valid.serverPropsReturn({})).toBe(true)
	expect(valid.serverPropsReturn({ foo: "bar" })).toBe(true)
})

test("serverPaths return", () => {
	expect(valid.serverPathsReturn(undefined)).toBe(false)
	expect(valid.serverPathsReturn([])).toBe(false)
	expect(valid.serverPathsReturn([{ path: "/foo/bar" }])).toBe(false)
	expect(valid.serverPathsReturn([{ path: "/foo/bar", props: undefined }])).toBe(false)
	expect(valid.serverPathsReturn([{ path: "/foo/bar", props: { foo: "bar" } }])).toBe(true)
})
