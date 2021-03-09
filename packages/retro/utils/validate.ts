// validateObject asserts a value strictly matches an object.
function validateObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

// validateObject asserts a value strictly matches an array.
function validateArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

////////////////////////////////////////////////////////////////////////////////

interface UnknownObject {
	[key: string]: unknown
}

export function validateStaticModuleExports(exports: unknown): boolean {
	if (!validateObject(exports)) return false
	const known = exports as UnknownObject
	switch (true) {
		case !(known.serverProps === undefined || typeof known.serverProps === "function"):
		case !(known.Head === undefined || typeof known.Head === "function"):
		case !(typeof known.default === "function"): // NOTE: exports.default is required.
			return false
	}
	return true
}

export function validateDynamicModuleExports(exports: unknown): boolean {
	if (!validateObject(exports)) return false
	const known = exports as UnknownObject
	switch (true) {
		case !(known.serverPaths === undefined || typeof known.serverPaths === "function"):
		case !(known.Head === undefined || typeof known.Head === "function"):
		case !(typeof known.default === "function"): // NOTE: exports.default is required.
			return false
	}
	return true
}

////////////////////////////////////////////////////////////////////////////////

export function validateServerPropsReturn(ret: unknown): boolean {
	return validateObject(ret)
}

export function validateServerPathsReturn(ret: unknown): boolean {
	if (!validateArray(ret) || (ret as unknown[]).length === 0) return false
	const known = ret as unknown[]
	const ok = known.every(meta => {
		if (!validateObject(meta)) return false
		const known = meta as UnknownObject

		// prettier-ignore
		const ok = (
			("path" in known && typeof known.path === "string") &&
			("props" in known && validateObject(known.props))
		)
		return ok
	})
	return ok
}
