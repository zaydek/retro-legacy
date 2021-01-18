import React from "react"
import ReactDOMServer from "react-dom/server"

async function awaitRun() {
	const { load, head: Head } = require("%RETRO_STATIC_PATH%")
	const loadProps = await load()
	const head = ReactDOMServer.renderToStaticMarkup(<Head {...loadProps} />)
	// .replace(/\/>/g, " />") // /> -> ·/>
	// .replace(/></g, ">\n<") // >< -> >\n<
	console.log(JSON.stringify({ loadProps, head }))
}

;(async () => {
	await awaitRun()
})()
