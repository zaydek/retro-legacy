// const dynamic = "HelloWorld"
//
// function run() {
// 	// const HelloWorld = require(`./HelloWorld.tsx`)
// 	const HelloWorld = require(`./${dynamic}.tsx`)
// 	console.log(HelloWorld)
// }
//
// run()

function run() {
	for (const each of ["PageA", "PageB"]) {
		const Component = require(each)
		console.log(Component)
	}
}

run()
