import { useState } from "react"

function App() {
	const [state, setState] = useState(0)
	return (
		<div>
			<button onClick={() => setState(state + 1)}>{state}</button>
		</div>
	)
}

ReactDOM.render(<App />, document.getElementById("root"))
