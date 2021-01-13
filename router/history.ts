import { createBrowserHistory } from "history"

// FIXM@
let history = null
try {
	history = createBrowserHistory()
} catch (err) {}

export default history as any // FIXME
