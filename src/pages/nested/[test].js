// serverProps resolves paths on the server for dynamic pages. The returned
// array describes { path, props }, where path creates a page and props are
// forwarded as <Head {...{ path, ...props }}> and
// <Page {...{ path, ...props }}>.
//
// prettier-ignore
export async function serverPaths() {
	return [
		{ path: "/bulbasaur",  props: { name: "Bulbasaur",  type: "🌱" } },
		{ path: "/charmander", props: { name: "Charmander", type: "🔥" } },
		{ path: "/pikachu",    props: { name: "Pikachu",    type: "⚡️" } },
		{ path: "/squirtle",   props: { name: "Squirtle",   type: "💧" } },
		// { path: "/squirtle",   props: { name: "Squirtle",   type: "💧" } },
	]
}

export function Head() {
	return <title>Hello, world!</title>
}

export default function Page() {
	return <h1>Oops, this is the wrong page</h1>
}
