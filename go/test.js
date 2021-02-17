const React = require("react")
const ReactDOMServer = require("react-dom/server")

const Component = require("./Component.js")

console.log(ReactDOMServer.renderToString(React.createElement(Component)))
