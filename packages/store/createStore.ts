import * as React from "react"
import * as types from "./types"
import * as utils from "./utils"

import STORE_KEY from "./key"

// This implementation is inspired by:
//
// - https://github.com/mucsi96/react-create-shared-state
// - https://github.com/pelotom/use-methods

const errBadStoreFromCaller = (caller: string): string =>
	`${caller}: Bad store. ` +
	"Use 'createStore(initialStateOrInitializer)' to create a new store and then 'const [state, setState] = useStore(store)'."

const errBadFuncsCreatorFromCaller = (caller: string): string =>
	`${caller}: Bad createFuncs. ` +
	"Use 'const createFuncs = state => ({ increment() { return state + 1 } })' and then 'const [state, funcs] = useStoreFuncs(store, createFuncs)'."

export const createStore: types.createStore = (initialState, initializer) => {
	const subscriptions = new Set<React.Dispatch<typeof initialState>>()

	let state: typeof initialState
	if (typeof initializer === "function") {
		state = utils.freezeOnce(initializer(initialState))
	} else {
		state = utils.freezeOnce(initialState)
	}
	return { type: STORE_KEY, subscriptions, initialState: state, cachedState: state }
}

function useStoreImpl<T>(
	caller: string,
	store: types.Store<T>,
	createFuncs?: types.FuncsCreator,
): [T, React.Dispatch<T> | types.Funcs<T>] {
	React.useCallback(() => {
		if (!utils.testStore(store)) {
			throw new Error(errBadStoreFromCaller(caller))
		}
		if (typeof createFuncs !== undefined && typeof createFuncs !== "function") {
			throw new Error(errBadFuncsCreatorFromCaller(caller))
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const [state, setState] = React.useState(store.cachedState)
	const frozenState = utils.freezeOnce(state)

	// Manages subscriptions when a component mounts / unmounts.
	React.useEffect(() => {
		store.subscriptions.add(setState)
		return (): void => {
			store.subscriptions.delete(setState)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const setStateStore = React.useCallback(updater => {
		const nextFrozenState = utils.freezeOnce(typeof updater === "function" ? updater(store.cachedState) : updater)
		store.cachedState = nextFrozenState
		setState(nextFrozenState)
		// Broadcast frozenState changes to subscribers:
		//
		// NOTE: Use 'forEach' not 'for'; Type 'Set<Dispatch<T>>' is not an array
		// type or a string type. Use compiler option '--downlevelIteration' to
		// allow iterating of iterators.ts(2569)
		store.subscriptions.forEach(set => {
			// Dedupe the current setState:
			if (set !== setState) {
				set(nextFrozenState)
			}
		})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const funcKeys = React.useMemo(() => {
		if (createFuncs === undefined) {
			return undefined
		}
		return Object.keys(createFuncs(frozenState))
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// Does not use React.useMemo because state changes on every pass.
	let funcs
	if (createFuncs !== undefined && funcKeys !== undefined) {
		// TODO: If we use useReducer we don’t need to use funcKeys.reduce on every
		// render but then React errors: Warning: Cannot update a component (`xxx`)
		// while rendering a different component (`xxx`).
		funcs = funcKeys.reduce<types.Funcs<T>>((accum, type) => {
			accum[type] = (...args): T => {
				const nextState = createFuncs(frozenState)[type]!(...args)
				setStateStore(nextState)
				return nextState
			}
			return accum
		}, {})
	}

	// useStore:
	if (funcs === undefined) {
		return [frozenState, setStateStore]
	}
	// useStoreFuncs:
	return [frozenState, funcs]
}

export const useStore: types.useStore = <T>(store: types.Store<T>) => {
	return useStoreImpl("useStore", store) as [T, React.Dispatch<T>] // Needs 'as' because of '|' operator
}

export const useStoreState: types.useStoreState = store => {
	return useStoreImpl("useStoreState", store)[0]
}

export const useStoreSetState: types.useStoreSetState = <T>(store: types.Store<T>) => {
	return useStoreImpl("useStoreSetState", store)[1] as React.Dispatch<T> // Needs 'as' because of '|' operator
}

export const useStoreFuncs: types.useStoreFuncs = <T>(store: types.Store<T>, createFuncs: types.FuncsCreator) => {
	return useStoreImpl("useStoreFuncs", store, createFuncs) as [T, types.Funcs<T>]
}
