import ReactDOM from "react-dom"
import { useEffect } from "react"

export default function App() {
	useEffect(() => {
		console.log("Hello, world!")
	}, [])

	return <h1>Hello, world!</h1>
}

ReactDOM.render(
	<React.StrictMode>
		<App />
	</React.StrictMode>,
	document.getElementById("root"),
)
