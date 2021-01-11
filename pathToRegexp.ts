import { match as createMatch } from "path-to-regexp"

function run() {
	const match = createMatch("/:hello/:world")
	const res = match("/hello/world")
	if (!res) {
		console.log("none")
		return
	}
	console.log({ ...res.params })

	// const keys: Key[] = []
	// const re = pathToRegexp("/:hello/:world", keys)
	// const res = re.exec("/a/b")
	// if (!res) {
	// 	console.log("none")
	// 	return
	// }
	// const matches = res.slice(1)
	// console.log({ matches, keys })
}

;(() => {
	run()
})()
