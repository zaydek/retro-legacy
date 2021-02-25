import pokemon from "../data/pokemon"

export function serverPaths() {
	return pokemon.map(each => ({
		path: "/" + each.name.toLowerCase(),
		props: { ...each },
	}))
}

export function Head({ name, type }) {
	return (
		<>
			<title>Hello, {name}!</title>
			<meta type="title" value={`Hello, ${name}!`} />
			<meta type="description" value={`This page is about ${name} -- a ${type} type Pokémon!`} />
		</>
	)
}

export default function Page({ name, type }) {
	return (
		<>
			<h1>Hello, {name}!</h1>
			<p>
				This page is about {name} -- a {type} type Pokémon!
			</p>
		</>
	)
}
