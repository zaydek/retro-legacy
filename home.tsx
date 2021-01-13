import React, { useEffect } from "react"

// TODO: We should add some kind of `pages` top-level function for interacting
// with generated pages. An example API would be like:
//
// // TODO: Should we return an array or a map? Arrays are easier to reason
// // about but maps are more ‘correct’. If we allow arrays, we should warn to
// // end-user if there are repeat-keys.
// export async function pages() {
//   return {
//     bulbasaur:  await getStats("bulbasaur"),
//     charmander: await getStats("charmander"),
//     pikachu:    await getStats("pikachu"),
//     squirtle:   await getStats("squirtle"),
//   }
// }
//
// // This API is easier to reason about. Maps are more terse.
// export async function pages() {
//   return [
//     {
//       page: "bulbasaur",
//       props: await getStats("bulbasaur"),
//     },
//     {
//       page: "charmander",
//       props: await getStats("charmander"),
//     },
//     {
//       page: "pikachu",
//       props: await getStats("pikachu"),
//     },
//     {
//       page: "squirtle",
//       props: await getStats("squirtle"),
//     },
//   ]
// }
//
// We should also warn if the page is not dynamic in the first place, for
// example if the page does not use `:pokemon.tsx` syntax. Moreover, do we need
// to be concerned about using `:` syntax? Is that OS-dependent? Is that why
// Next.js uses `[...]` syntax?
//
// Note that pages should be allowed to be `async` in case the pages themselves
// are non-deterministic or generated via an API. This is different from `load`
// because `load` provides deserialized props from the cache, whereas `pages`
// provides a manifest for the router.
//
// A simpler API would be we can either use `load` is the pagename is **not**
// dynamic and we can use `pages` (as a loader) is the pagename **is** dynamic.
// We can warn to the end-user is there’s a mismatch.
//
// `load` returns `async` props for a one-off page whereas `pages` returns
// `async` props per page (where the pagename can also be dynamic, not just the
// props).

export async function load() {
	const p = new Promise(resolve => {
		setTimeout(() => {
			resolve({ data: "Hello, world!" })
		}, 1e3)
	})
	return p
}

// TODO: Should be a one-off React element or a fragment of React elements.
export function head() {
	return <title>Hello, world! (page A)</title>
}

interface HomeProps {
	data: string
}

// prettier-ignore
export default function Home({ data }: HomeProps) {
	useEffect(() => {
		console.log("Hello, world!")
	}, [])

	return  (
		<div>
			<h1>
				Hello, world!
			</h1>
			<a href="home-2">go to other page</a>
			<pre>
				{JSON.stringify(data, null, 2)}
			</pre>
		</div>
	)
}
