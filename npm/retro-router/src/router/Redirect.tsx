import { useHistory } from "./BrowserRouter"

export interface RedirectProps {
	path: string
	shouldReplaceHistory?: boolean
}

// Redirect is a renderless component. It delegates to history.replace or
// history.push. This causes Router to rerender because Router is listening for
// history changes; e.location.pathname. Router then routes to the correct
// component or routes to /404.
export function Redirect({ path, shouldReplaceHistory }: RedirectProps) {
	const history = useHistory()!

	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(path)
	return null
}
