import { createBrowserHistory } from "history"

// FIXME
let history = null
try {
	history = createBrowserHistory()
} catch (err) {}

export default history as any // FIXME
