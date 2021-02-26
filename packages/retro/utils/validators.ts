function validateObject(value: unknown): boolean {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

function validateArray(value: unknown): boolean {
	return typeof value === "object" && value !== null && Array.isArray(value)
}

export function validateServerPropsReturn(value: unknown): boolean {
	return validateObject(value)
}

export function validateServerPathsReturn(value: unknown): boolean {
	type UnknownArray = unknown[]
	type UnknownObject = { [key: string]: unknown }

	// prettier-ignore
	const ok = validateArray(value) &&
		(value as UnknownArray).every(each => {
			const ok = validateObject(each) &&
				("path" in (each as UnknownObject) && typeof (each as UnknownObject).path === "string") &&
				("props" in (each as UnknownObject) && validateServerPropsReturn((each as UnknownObject).props))
			return ok
		})
	return ok
}
