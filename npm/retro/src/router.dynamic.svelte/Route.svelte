<!-- prettier-ignore -->
<script>
	import { registerPath, store } from "./store.js"

	export let component = undefined // Use zero values to surpress warnings
	export let path = ""             // Use zero values to surpress warnings

	registerPath(path)
</script>

<!-- A: <Route component={...} /> -->
<!-- B: <Route>{...}</Route> -->
{#if $store.path === path}
	{#if component}
		<svelte:component this={component} />
	{:else}
		<slot />
	{/if}
{/if}
