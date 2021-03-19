// const React = require("react")
// const ReactDOMServer = require("react-dom/server")
//
// const Index = require("./src/pages/index.js")
// console.log(Index)
// console.log(ReactDOMServer.renderToString(React.createElement(Index)))

require("esbuild").build({
	bundle: true,
	define: {
		"process.env.NODE_ENV": JSON.stringify("development"),
	},
	entryPoints: ["src/pages/index.js"],
	external: ["react", "react-dom"],
	format: "cjs",
	loader: {
		".js": "jsx",
	},
	outfile: "index.esbuild.js",
})

const path = require("path")
const mod = require(path.resolve("index.esbuild.js"))

const React = require("react")
const ReactDOMServer = require("react-dom/server")

console.log(ReactDOMServer.renderToString(React.createElement(mod.Head)))
console.log(ReactDOMServer.renderToString(React.createElement(mod.default)))
