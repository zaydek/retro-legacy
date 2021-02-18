export type ResolvedProps = any

// prettier-ignore
export type ResolvedPathsArray = {
	path:   string
	props?: ResolvedProps
}[]

export interface ResolvedPaths {
	[key: string]: ResolvedProps
}

export interface RouteInfo {
	route: PageBasedRoute
	props: ResolvedProps
}

////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
export interface StaticPage {
	Head?:    (resolvedProps: ResolvedProps) => JSX.Element
	default?: (resolvedProps: { path: string } & ResolvedProps) => JSX.Element
}

export interface DynamicPage extends StaticPage {
	serverProps: ResolvedProps
	serverPaths: ResolvedPaths
}

////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
interface PageBasedRoute {
	src_path:  string // src/pages/path/to/component.js
	dst_path:  string // path/to/component.html
	path:      string // /path/to/component
	component: string // PagePathToComponent
}

// prettier-ignore
export interface Runtime {
	version: string
	command: {
		// type: string     // TODO
		cached: boolean     // --cached
		source_map: boolean // --source-map
		port: number        // --port
	}
	dir_config: {
		asset_dir: string
		pages_dir: string
		cache_dir: string
		build_dir: string
	}
	base_page: string
	page_based_router: PageBasedRoute[]
}
