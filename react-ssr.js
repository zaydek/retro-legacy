const React = require("react")
const ReactDOMServer = require("react-dom/server")

const store = require("./packages/store")

// const myStore = store.createStore({})

function Component() {
	// const [state, setState] = store.useStore(myStore)

	const name = "yolo"

	React.useEffect(() => {
		console.log(`Hello, ${name}!`)
	}, [name])
	return React.createElement("h1", null, "Hello, world!")
}

// console.log("hello, world!")
console.log({ out: ReactDOMServer.renderToStaticMarkup(React.createElement(Component)) })
console.log({ out: ReactDOMServer.renderToString(React.createElement(Component)) })
