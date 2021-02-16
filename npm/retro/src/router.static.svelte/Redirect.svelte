<script>
	import { replaceState } from "./Router.svelte"

	export let path
	export let scrollTo = [0, 0]

	replaceState(path, scrollTo)
</script>

<!-- <Redirect> is a renderless component. -->
