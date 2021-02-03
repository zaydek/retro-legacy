import * as types from "./types"
import { scrollToImpl } from "./scrollToImpl"
import { useHistory } from "./BrowserRouter"

export const Redirect: typeof types.Redirect = ({ path, shouldReplaceHistory, scrollTo }) => {
	const history = useHistory()!

	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(path)

	// TODO: We need to check whether scrollToImpl is evaluated eagerly or lazily;
	// before or after <Router> rerenders.
	scrollToImpl(scrollTo)
	return null
}
