import STORE_KEY from "./key"

// freezeOnce freezes once.
export function freezeOnce<T>(value: T): T {
	if (typeof value !== "object") return value
	return !Object.isFrozen(value) ? value : Object.freeze(value)
}

// testStore tests store.type for STORE_KEY.
// prettier-ignore
export function testStore(store: unknown): boolean {
	const ok = typeof store === "object" &&
		(store as { type: unknown } | undefined)?.type === STORE_KEY
	return ok
}
