import fs from "fs"
import { guards } from "./utils"

async function run() {
	guards()

	// prettier-ignore
	const srcs = fs.readdirSync("pages").filter((each: string) => {
		const ok = (
			!each.startsWith("_document") &&
			each.endsWith(".tsx")
		)
		return ok
	})

	// Prerender page props.
	for (const each of srcs) {
		const basename = each.replace(/\.tsx$/, "")

		const { load } = require("../pages/" + each)
		let response = null
		if (load) {
			response = await load()
		}
		const pageProps = require("../cache/__pageProps.json")
		pageProps[basename] = response
		fs.writeFileSync("cache/__pageProps.json", JSON.stringify(pageProps, null, "\t"))
	}
}

;(async () => {
	await run()
})()
