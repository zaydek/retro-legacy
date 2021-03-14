function testStrictObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function testStrictArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

////////////////////////////////////////////////////////////////////////////////

interface UnknownObject {
	[key: string]: unknown
}

export function staticModuleExports(exports: unknown): boolean {
	if (!testStrictObject(exports)) return false
	const known = exports as UnknownObject
	switch (true) {
		case !(known.serverProps === undefined || typeof known.serverProps === "function"):
		case !(known.Head === undefined || typeof known.Head === "function"):
		case !(typeof known.default === "function"): // Required
			return false
	}
	return true
}

export function dynamicModuleExports(exports: unknown): boolean {
	if (!testStrictObject(exports)) return false
	const known = exports as UnknownObject
	switch (true) {
		case !(known.serverPaths === undefined || typeof known.serverPaths === "function"):
		case !(known.Head === undefined || typeof known.Head === "function"):
		case !(typeof known.default === "function"): // Required
			return false
	}
	return true
}

////////////////////////////////////////////////////////////////////////////////

export function serverPropsReturn(ret: unknown): boolean {
	return testStrictObject(ret)
}

export function serverPathsReturn(ret: unknown): boolean {
	if (!testStrictArray(ret) || (ret as unknown[]).length === 0) return false
	const known = ret as unknown[]
	const ok = known.every(meta => {
		if (!testStrictObject(meta)) return false
		const known = meta as UnknownObject

		// prettier-ignore
		const ok = (
			("path" in known && typeof known.path === "string") &&
			("props" in known && testStrictObject(known.props))
		)
		return ok
	})
	return ok
}
