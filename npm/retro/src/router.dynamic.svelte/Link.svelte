<script>
	import { pushState } from "./store.js"

	export let path
	export let scrollTo = [0, 0]

	$: scoped = typeof path === "string" && !/^https?:\/\//.test(path)
</script>

<a
	href={path}
	target={scoped ? undefined : "_blank"}
	rel={scoped ? undefined : "noreferrer noopener"}
	on:click={scoped
		? e => {
				e.preventDefault()
				pushState(path, scrollTo)
		  }
		: undefined}
	{...$$restProps}
>
	<slot />
</a>
