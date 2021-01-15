// Isomorphic Go types. In the future these should be able to be auto-generated.

// prettier-ignore
export interface PageBasedRoute {
	path:      string
	page:      string
	component: string
}

export type PageBasedRouter = PageBasedRoute[]

// prettier-ignore
export interface Configuration {
	PAGES_DIR:       string
	CACHE_DIR:       string
	BUILD_DIR:       string
	ReactStrictMode: boolean
}

// prettier-ignore
export interface RequestPayload {
	config: Configuration
	router: PageBasedRouter
}
