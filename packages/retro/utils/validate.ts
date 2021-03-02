function validateObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

export function validateStaticModuleExports(module_: unknown): boolean {
	if (!validateObject(module_)) return false

	const known = module_ as { [key: string]: unknown }
	if (known.serverProps !== undefined && typeof known.serverProps !== "function") {
		return false
	} else if (known.Head !== undefined && typeof known.Head !== "function") {
		return false
	} else if (typeof known.default !== "function") {
		return false
	}
	return true
}

export function validateDynamicModuleExports(module_: unknown): boolean {
	if (!validateObject(module_)) return false

	const known = module_ as { [key: string]: unknown }
	if (known.serverPaths !== undefined && typeof known.serverPaths !== "function") {
		return false
	} else if (known.Head !== undefined && typeof known.Head !== "function") {
		return false
	} else if (typeof known.default !== "function") {
		return false
	}
	return true
}

export function validateServerPropsReturn(return_: unknown): boolean {
	return validateObject(return_)
}

export function validateServerPathsReturn(return_: unknown): boolean {
	if (!validateArray(return_) || (return_ as unknown[]).length === 0) return false

	const known = return_ as unknown[]
	const ok = known.every(meta => {
		if (!validateObject(meta)) return false
		const known = meta as { [key: string]: unknown }
		return "path" in known && typeof known.path === "string" && "props" in known && validateObject(known.props)
	})
	return ok
}
