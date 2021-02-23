const React = require("react")

module.exports = function Component() {
	React.useEffect(() => {
		console.log("Hello, world!")
	})
	return React.createElement("h1", null, "Hello, world!")
}
