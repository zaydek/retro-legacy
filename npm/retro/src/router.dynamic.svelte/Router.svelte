<script>
	import { handler, store } from "./store.js"
	import { onMount } from "svelte"

	onMount(() => {
		function handlePopState() {
			handler(window.location.pathname)
		}
		handler(window.location.pathname) // Once
		console.log($store.params)
		window.addEventListener("popstate", handlePopState)
		return () => window.removeEventListener("popstate", handlePopState)
	})
</script>

<slot />
