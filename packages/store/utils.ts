import STORE_KEY from "./key"

// freezeOnce freezes once.
export function freezeOnce<T>(value: T): T {
	if (typeof value !== "object") return value
	return !Object.isFrozen(value) ? value : Object.freeze(value)
}

// testStore tests store.type for STORE_KEY.
//
// TODO: Add tests.
export function testStore(store: any): boolean {
	return store?.type === STORE_KEY
}
