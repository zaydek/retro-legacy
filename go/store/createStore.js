import STORE_KEY from "./key"
import { freeze, testMethods, testStore } from "./utils"
import { useCallback, useEffect, useMemo, useState } from "react"

// This implementation is inspired by:
//
// - https://github.com/mucsi96/react-create-shared-state
// - https://github.com/pelotom/use-methods

const errBadStore =
	"useStore: Bad store. " +
	"Use createStore(initialStateOrInitializer) to create a new store and then const [state, setState] = useStore(store)."

const errBadReducer =
	"useStore: Bad methods. " +
	"Use const methods = state => ({ increment() { return state + 1 } }) then const [state, funcs] = useStore(store, methods)."

// Creates a store.
export function createStore(initialStateOrInitializer) {
	const subscriptions = new Set()

	const initialState = freeze(
		typeof initialStateOrInitializer === "function" ? initialStateOrInitializer() : initialStateOrInitializer,
	)

	// Caches the current state for when a component mounts; see
	// useState(store.cachedState).
	let cachedState = freeze(initialState)

	return { __type__: STORE_KEY, subscriptions, initialState, cachedState }
}

// Consumes a store; returns a state and setState accessor.
export function useStore(store, methods = null) {
	useCallback(() => {
		if (!testStore(store)) {
			throw new Error(errBadStore)
		}
		if (methods !== null && !testMethods(methods)) {
			throw new Error(errBadReducer)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	let [state, setState] = useState(store.cachedState)
	state = Object.freeze(state)

	// Manages subscriptions when a component mounts / unmounts.
	useEffect(() => {
		store.subscriptions.add(setState)
		return () => {
			store.subscriptions.delete(setState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const customSetState = useCallback(updater => {
		const nextState = freeze(typeof updater === "function" ? updater(store.cachedState) : updater)
		store.cachedState = nextState
		setState(nextState)
		for (const set of store.subscriptions) {
			// Dedupe the current setState:
			if (set !== setState) {
				set(nextState)
			}
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const funcKeys = useMemo(() => {
		if (methods === null) {
			return null
		}
		return Object.keys(methods(state))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// Does not use useMemo because state changes on every pass.
	let funcs
	if (methods !== null) {
		// TODO: If we use useReducer we don’t need to use funcKeys.reduce on every
		// render but then React errors: Warning: Cannot update a component (`xxx`)
		// while rendering a different component (`xxx`).
		funcs = funcKeys.reduce((accum, type) => {
			accum[type] = (...args) => {
				const nextState = methods(state)[type](...args)
				customSetState(nextState)
			}
			return accum
		}, {})
	}

	// useReducer API:
	if (funcs === undefined) {
		return [state, customSetState]
	}
	// useState API:
	return [state, funcs]
}

// Consumes a store; returns a state accessor.
//
// TODO: Rename to useStoreState; useStore, useStoreState, useStoreSetState.
// TODO: Do we want useStoreReducer?
export function useStoreValue(store) {
	return useStore(store)[0]
}

// Consumes a store; returns a setState accessor.
export function useStoreSetState(store) {
	return useStore(store)[1]
}
