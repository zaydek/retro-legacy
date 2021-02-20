import * as React from "react"

import STORE_KEY from "./key"

export interface Store<T> {
	type: typeof STORE_KEY
	subscriptions: Set<React.Dispatch<T>>
	initialState: T
	cachedState: T
}

// Funcs describes methods that return the next state.
export type Funcs<T> = { [key: string]: (...args: unknown[]) => T }

// FuncsCreator creates methods that return the next state.
export type FuncsCreator = <T>(state: T) => Funcs<T>

// createStore creates a store that can then be consumer.
export type createStore = <T>(initialState: T, initializer?: (initialState: T) => T) => Store<T>

// useStore consumes a store and returns a state and setState accessor.
export type useStore = <T>(store: Store<T>) => [T, React.Dispatch<T>]

// useStoreState consumes a store and returns a state accessor.
export type useStoreState = <T>(store: Store<T>) => T

// useStoreSetState consumes a store and returns a setState accessor.
export type useStoreSetState = <T>(store: Store<T>) => React.Dispatch<T>

// useStoreFuncs consumes a store and returns a funcs accessor.
export type useStoreFuncs = <T>(store: Store<T>, createFuncs: FuncsCreator) => [T, Funcs<T>]
