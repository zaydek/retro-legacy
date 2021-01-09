import { render } from "react-dom/server"

function Component() {
	const [state, setState] = useState(0)
	return (
		<div>
			<button onClick={() => setState(state + 1)}>{state}</button>
		</div>
	)
}

render(<Component />, document.getElementById("root"))
