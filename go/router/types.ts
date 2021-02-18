export type ScrollTo = number | [number, number]

// prettier-ignore
export interface LinkProps {
	path:      string
	scrollTo?: number | [number, number]
	children?: React.ReactNode
}

// prettier-ignore
export interface RouteProps {
	path:      string
	children?: React.ReactNode
}
