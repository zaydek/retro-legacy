import { history } from "./history"

export interface RedirectProps {
	page: string
	shouldReplaceHistory?: boolean
}

export function Redirect({ page, shouldReplaceHistory }: RedirectProps) {
	const fn = shouldReplaceHistory ? history.replace : history.push
	fn(page)
	return null
}
