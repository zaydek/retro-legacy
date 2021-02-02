import { ScrollTo, scrollToImpl } from "./scrollToImpl"
import { useHistory } from "./BrowserRouter"

export interface RedirectProps {
	path: string
	shouldReplaceHistory?: boolean
	scrollTo?: ScrollTo
}

export function Redirect({ path, shouldReplaceHistory, scrollTo }: RedirectProps) {
	const history = useHistory()!

	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(path)

	// TODO: We need to check whether scrollToImpl is evaluated eagerly or lazily;
	// before or after <Router> rerenders.
	scrollToImpl(scrollTo)
	return null
}
