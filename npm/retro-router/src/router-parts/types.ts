export interface Part {
	// The part: `hello` or `[hello]`.
	part: string
	// Does the part use dynamic syntax?
	dynamic: boolean
	// Does the part use nesting syntax?
	nests: boolean
}

export interface RouteInfo {
	// Page name: `/hello`.
	page: string
	// Component name: `PageHello`.
	component: string
}
