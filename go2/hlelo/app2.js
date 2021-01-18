// import React from "react"
// import ReactDOMServer from "react-dom/server"

// Synthetic requires


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
	await asyncRun([,
	])
})()
