<!-- prettier-ignore -->
<script>
	import { pathStore, registerPath } from "./Router.svelte"

	export let component = undefined // Use zero values to surpress warnings
	export let path = ""             // Use zero values to surpress warnings

	registerPath(path)
</script>

{#if $pathStore === path}
	{#if component}
		<!-- <Route component={...} /> -->
		<svelte:component this={component} />
	{:else}
		<!-- <Route>{...}</Route> -->
		<slot />
	{/if}
{/if}
