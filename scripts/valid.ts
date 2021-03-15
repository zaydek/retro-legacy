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
	if (!testStrictObject(exports)) {
		return false
	}
	const map = exports as UnknownObject
	switch (true) {
		case !(map["serverProps"] === undefined || typeof map["serverProps"] === "function"):
		case !(map["Head"] === undefined || typeof map["Head"] === "function"):
		case !(typeof map["default"] === "function"): // Required
			return false
	}
	return true
}

export function dynamicModuleExports(exports: unknown): boolean {
	if (!testStrictObject(exports)) {
		return false
	}
	const map = exports as UnknownObject
	switch (true) {
		case !(map["serverPaths"] === undefined || typeof map["serverPaths"] === "function"):
		case !(map["Head"] === undefined || typeof map["Head"] === "function"):
		case !(typeof map["default"] === "function"): // Required
			return false
	}
	return true
}

////////////////////////////////////////////////////////////////////////////////

export function serverPropsReturn(return_: unknown): boolean {
	return testStrictObject(return_)
}

export function serverPathsReturn(return_: unknown): boolean {
	if (!testStrictArray(return_) || (return_ as unknown[]).length === 0) {
		return false
	}
	const arr = return_ as unknown[]
	const ok = arr.every(meta => {
		if (!testStrictObject(meta)) {
			return false
		}
		const known = meta as UnknownObject
		// prettier-ignore
		const ok = (
			("path" in known && typeof known["path"] === "string") &&
			("props" in known && testStrictObject(known["props"]))
		)
		return ok
	})
	return ok
}
