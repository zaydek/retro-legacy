import React from "react"
import ReactDOMServer from "react-dom/server"

async function awaitRun() {
	const { load, head: Head } = require("./retro-app/pages/index")
	const loadProps = await load()
	console.log({ loadProps, head: ReactDOMServer.renderToString(<Head {...loadProps} />) })
}

;(async () => {
	await awaitRun()
})()
