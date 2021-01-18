// Synthetic imports
import a from "./a.js"
import b from "./b.js"

function run(imports) {
	for (each of imports) {
		console.log(each)
	}
}

;(() => {
	// Synthetic imports array
	run([a, b])
})()
