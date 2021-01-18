import React from "react"
import ReactDOMServer from "react-dom/server"

// Synthetic requires
const index = require("./retro-app/pages/index.js")

async function asyncRun(imports) {
	const chain = []
	for (const each of imports) {
		const p = new Promise(async resolve => {
			const { load, head: Head } = each.imports
			const loadProps = await load()
			const head = ReactDOMServer.renderToStaticMarkup(<Head {...loadProps} />)
			resolve({ name: each.name, loadProps, head })
		})
		chain.push(p)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.name] = { ...each, name: undefined }
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap))
}

;(async () => {
	// Synthetic imports array
	await asyncRun([{ name: "index", imports: index }])
})()
