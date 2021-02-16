import { parseParts, parseParams } from "./parts/parts.js"
import { get, writable } from "svelte/store"

const routes = {}

export function registerPath(path) {
	routes[path] = parseParts(path)
}

export function registeredPathExists(path) {
	return routes[path] !== undefined
}

export const store = writable({
	path: "__INIT__",
	parts: parseParts(typeof window === "undefined" ? "/" : window.location.pathname),
	params: {},
})

// Handler for window.location.pathname changes.
export function handler(pathname) {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	let next_path = "/404" // Assume "/404" as the fallback path
	let next_params = {}
	for (const each of Object.keys(routes)) {
		const cmp = parseParts(path)
		const p = parseParams(routes[each], cmp, { strict: false })
		if (p !== null) {
			next_path = each
			next_params = p
			break
		}
	}
	store.update(current => ({
		...current,
		path: next_path,
		params: next_params,
	}))
}

// Auxiliary function for window.history.pushState.
export function pushState(pathname, scrollTo = [0, 0]) {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	// Dedupe paths:
	if (path === get(store)) {
		// No-op
		return
	}
	handler(path)
	if (registeredPathExists(path)) window.history.pushState({}, "", path)
	window.scrollTo(scrollTo[0], scrollTo[1])
}

// Auxiliary function for window.history.replaceState.
export function replaceState(pathname, scrollTo = [0, 0]) {
	let path = pathname
	if (path.endsWith(".html")) {
		path = path.slice(0, -5)
	}
	// Dedupe paths:
	if (path === get(store)) {
		// No-op
		return
	}
	handler(path)
	if (registeredPathExists(path)) window.history.replaceState({}, "", path)
	window.scrollTo(scrollTo[0], scrollTo[1])
}
