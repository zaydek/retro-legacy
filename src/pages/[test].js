// serverProps resolves paths on the server for dynamic pages. The returned
// array describes { path, props }, where path creates a page and props are
// forwarded as <Head {...{ path, ...props }}> and
// <Page {...{ path, ...props }}>.
//
// prettier-ignore
export async function serverPaths() {
	return new Promise((resolve, reject) => {
		setTimeout(() => {
			resolve([
				{ path: "/bulbasaur",  props: { name: "Bulbasaur",  type: "🌱" } },
				{ path: "/charmander", props: { name: "Charmander", type: "🔥" } },
				{ path: "/pikachu",    props: { name: "Pikachu",    type: "⚡️" } },
				{ path: "/squirtle",   props: { name: "Squirtle",   type: "💧" } },
				{ path: "/bulbasaur2",  props: { name: "Bulbasaur",  type: "🌱" } },
				{ path: "/charmander2", props: { name: "Charmander", type: "🔥" } },
				{ path: "/pikachu2",    props: { name: "Pikachu",    type: "⚡️" } },
				{ path: "/squirtle2",   props: { name: "Squirtle",   type: "💧" } },
				{ path: "/bulbasaur3",  props: { name: "Bulbasaur",  type: "🌱" } },
				{ path: "/charmander3", props: { name: "Charmander", type: "🔥" } },
				{ path: "/pikachu3",    props: { name: "Pikachu",    type: "⚡️" } },
				{ path: "/squirtle3",   props: { name: "Squirtle",   type: "💧" } },
				{ path: "/bulbasaur23",  props: { name: "Bulbasaur",  type: "🌱" } },
				{ path: "/charmander23", props: { name: "Charmander", type: "🔥" } },
				{ path: "/pikachu23",    props: { name: "Pikachu",    type: "⚡️" } },
				{ path: "/squirtle23",   props: { name: "Squirtle",   type: "💧" } },
				// { path: "/squirtle",   props: { name: "Squirtle",   type: "💧" } },
			])
		}, 1e3)
	})
}

// export function Head() {
// 	return <title>Hello, world!</title>
// }

export function Head({ name, type }) {
	return (
		<>
			<title>Hello, {name}!</title>
			<meta type="title" value={`Hello, ${name}!`} />
			<meta type="description" value={`This is a page about ${name} -- a ${type} type Pokémon!`} />
		</>
	)
}

// prettier-ignore
export default function Page({ name, type }) {
	return (
		<h1>
			This is the page for {name},{" "}
			a {type} type Pokemon
		</h1>
	)
}
