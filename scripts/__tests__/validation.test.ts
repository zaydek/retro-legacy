import {
	validateDynamicModuleExports,
	validateServerPathsReturn,
	validateServerPropsReturn,
	validateStaticModuleExports,
} from "../validation"

test("static module exports", () => {
	expect(validateStaticModuleExports({})).toBe(false)
	expect(validateStaticModuleExports({ default: undefined })).toBe(false)
	expect(validateStaticModuleExports({ default: () => {} })).toBe(true)
	expect(validateStaticModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validateStaticModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validateStaticModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validateStaticModuleExports({ serverProps: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(validateStaticModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
})

test("dynamic module exports", () => {
	expect(validateDynamicModuleExports({})).toBe(false)
	expect(validateDynamicModuleExports({ default: undefined })).toBe(false)
	expect(validateDynamicModuleExports({ default: () => {} })).toBe(true)
	expect(validateDynamicModuleExports({ Head: undefined, default: undefined })).toBe(false)
	expect(validateDynamicModuleExports({ Head: () => {}, default: () => {} })).toBe(true)
	expect(validateDynamicModuleExports({ serverPaths: undefined, Head: undefined, default: undefined })).toBe(false)
	expect(validateDynamicModuleExports({ serverPaths: () => {}, Head: () => {}, default: () => {} })).toBe(true)

	// API mismatch
	expect(validateDynamicModuleExports({ serverProps: undefined, Head: undefined, default: undefined })).toBe(false)
})

////////////////////////////////////////////////////////////////////////////////

test("serverProps return", () => {
	expect(validateServerPropsReturn(undefined)).toBe(false)
	expect(validateServerPropsReturn({})).toBe(true)
	expect(validateServerPropsReturn({ foo: "bar" })).toBe(true)
})

test("serverPaths return", () => {
	expect(validateServerPathsReturn(undefined)).toBe(false)
	expect(validateServerPathsReturn([])).toBe(false)
	expect(validateServerPathsReturn([{ path: "/foo/bar" }])).toBe(false)
	expect(validateServerPathsReturn([{ path: "/foo/bar", props: undefined }])).toBe(false)
	expect(validateServerPathsReturn([{ path: "/foo/bar", props: { foo: "bar" } }])).toBe(true)
})
