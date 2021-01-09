import { useState } from "react"

function Component() {
	const [state, setState] = useState(0)
	return (
		<div>
			<button onClick={() => setState(state + 1)}>{state}</button>
		</div>
	)
}
