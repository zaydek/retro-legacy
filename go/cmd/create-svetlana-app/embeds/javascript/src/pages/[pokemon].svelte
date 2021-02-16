<script context="module">
	// getServerProps resolves props on the server. Server props are then passed
	// component props.
	export async function getServerProps() {
		// ...
	}

	// getServerPaths resolves paths on the server for pages that use [dynamic]
	// syntax. Props from getServerPaths are passed as arguments.
	export async function getServerPaths() {
		// ...
	}
</script>

<script>
	// TODO: Add support for @components or $components syntax.
	import Greet from "../components/Greet.svelte"
</script>

<Greet who="Svetlana" />
