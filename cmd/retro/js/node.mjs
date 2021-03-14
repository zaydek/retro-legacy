import { readline, sleep, stderr, stdout } from "./utils.mjs"

// function resolveRouter() {}
//
// function resolveRoute() {}
//
// function run() {}

async function main() {
	while (true) {
		const bstr = await readline()
		if (bstr === undefined) {
			break
		}
		const msg = JSON.parse(bstr)
		stdout(msg)

		// switch (msg.Kind) {
		// 	case "foo":
		// 		stdout(msg)
		// 		break
		// 	case "bar":
		// 		stderr("oops")
		// 		break
		// 	default:
		// 		throw new Error("Internal error")
		// }
	}
}

main()
