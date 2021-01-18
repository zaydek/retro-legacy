// import React from "react"
// import ReactDOMServer from "react-dom/server"

// Synthetic requires
const PageIndex = require("./retro-app/pages/index.js")
const PageNestedSlashIndex = require("./retro-app/pages/nested/index.js")

async function asyncRun(imports) {
	const chain = []
	for (const each of imports) {
		const p = new Promise(async resolve => {
			const { load } = each.imports
			const loadProps = await load()
			resolve({ name: each.name, loadProps })
		})
		chain.push(p)
	}
	const resolvedAsArr = await Promise.all(chain)
	const resolvedAsMap = resolvedAsArr.reduce((acc, each) => {
		acc[each.name] = each.loadProps
		return acc
	}, {})
	console.log(JSON.stringify(resolvedAsMap, null, 2))
}

;(async () => {
	// Synthetic imports array
	await asyncRun([
		{ name: "PageIndex", imports: PageIndex }, 
		{ name: "PageNestedSlashIndex", imports: PageNestedSlashIndex },
	])
})()
