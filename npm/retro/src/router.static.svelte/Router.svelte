<!--

This implementation is loosely based on these articles:

- https://codechips.me/svelte-routing-with-page-js-part-1
- https://codechips.me/svelte-routing-with-page-js-part-2

-->
<script context="module">
	import { get, writable } from "svelte/store"
	import { onMount } from "svelte"

	const registeredPaths = {}

	// Registers a path to prevent recursive redirects.
	export function registerPath(path) {
		registeredPaths[path] = true
	}

	export function registerPathExists(path) {
		return registeredPaths[path] === true
	}

	// Trims ".html" from "index.html".
	export function trimHTMLSuffix(pathname) {
		if (/\.html?$/.test(pathname)) {
			return pathname.slice(0, -5)
		}
		return pathname
	}

	// Auxiliary function for window.history.pushState.
	export function pushState(path, scrollTo = [0, 0]) {
		// Dedupe repeat paths:
		if (path === get(pathStore)) {
			// No-op
			return
		}
		pathStore.set(path)
		if (registerPathExists(path)) window.history.pushState({}, "", trimHTMLSuffix(path))
		window.scrollTo(scrollTo[0], scrollTo[1])
	}

	// Auxiliary function for window.history.replaceState.
	export function replaceState(path, scrollTo = [0, 0]) {
		pathStore.set(path)
		if (registerPathExists(path)) window.history.replaceState({}, "", trimHTMLSuffix(path))
		window.scrollTo(scrollTo[0], scrollTo[1])
	}

	// Gets the current path (SSR ready).
	function getCurrentPath() {
		if (typeof window === "undefined") {
			return "/"
		}
		return trimHTMLSuffix(window.location.pathname)
	}

	export const pathStore = writable(getCurrentPath())
</script>

<script>
	onMount(() => {
		const handlePopState = () => {
			pathStore.set(getCurrentPath())
		}
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	})
</script>

<slot />
