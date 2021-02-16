<script>
	import { pushState, replaceState } from "./Router.svelte"
	import { registerPathExists } from "./Router.svelte"

	export let path
	export let scrollTo = [0, 0]

	// Describes whether the path is relative or absolute.
	$: scoped = typeof path === "string" && !/^https?:\/\//.test(path)
</script>

<a
	href={path}
	target={scoped ? undefined : "_blank"}
	rel={scoped ? undefined : "noreferrer noopener"}
	on:click={scoped
		? e => {
				e.preventDefault()
				if (!registerPathExists(path)) {
					replaceState("/404", scrollTo)
					return
				}
				pushState(path, scrollTo)
		  }
		: undefined}
	{...$$restProps}
>
	<slot />
</a>
