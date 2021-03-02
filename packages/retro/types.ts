////////////////////////////////////////////////////////////////////////////////
// CLI
////////////////////////////////////////////////////////////////////////////////

export interface DevCommand {
	type: "dev"
	cached: boolean
	sourcemap: boolean
	port: number
}

export interface ExportCommand {
	type: "export"
	cached: boolean
	sourcemap: boolean
}

export interface ServeCommand {
	type: "serve"
	mode: "spa" | "ssg"
	port: number
}

export type Command = DevCommand | ExportCommand | ServeCommand

////////////////////////////////////////////////////////////////////////////////
// Runtime
////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
export interface Directories {
	publicDirectory: string   // e.g. "public"
	srcPagesDirectory: string // e.g. "src/pages"
	cacheDirectory: string    // e.g. "__cache__"
	exportDirectory: string   // e.g. "__export__"
}

// prettier-ignore
export interface StaticPageInfo {
	type: "static"
	src: string       // e.g. "src/pages/index.js"
	dst: string       // e.g. "dst/index.html"
	path: string      // e.g. "/"
	component: string // e.g. "PageIndex"
}

// prettier-ignore
export interface DynamicPageInfo {
	type: "dynamic"
	src: string       // e.g. "src/pages/[index].js"
	component: string // e.g. "DynamicPageIndex"
}

export type PageInfo = StaticPageInfo | DynamicPageInfo

export interface Props {
	[key: string]: unknown
}

export type RouteProps = Props & { path: string }

// prettier-ignore
export interface Route {
	type: "static" | "dynamic"
	src: string       // e.g. "src/pages/index.js"
	dst: string       // e.g. "dst/index.html"
	path: string      // e.g. "/"
	component: string // e.g. "PageIndex"
}

export interface RouteMeta {
	route: Route
	props: RouteProps
}

export interface Router {
	[key: string]: RouteMeta
}

export interface Runtime<Cmd = Command> {
	command: Cmd
	directories: Directories
	document: string
	pages: PageInfo[] // The filesystem-based pages
	router: Router // The server-resolved router
	runServerGuards(): Promise<void>
	resolveDocument(): Promise<void>
	resolvePages(): Promise<void>
	resolveRouter(): Promise<void>
	purgeCacheDirectory(): Promise<void>
	purgeExportDirectory(): Promise<void>
}

////////////////////////////////////////////////////////////////////////////////
// TODO
////////////////////////////////////////////////////////////////////////////////

// StaticPageModule describes a static page module.
export interface StaticPageModule {
	Head?: (props: RouteProps) => JSX.Element
	default?: (props: RouteProps) => JSX.Element
	serverProps?(): Promise<RouteProps>
}

// DynamicPageModule describes a dynamic page module.
export interface DynamicPageModule {
	Head?: (props: RouteProps) => JSX.Element
	default?: (props: RouteProps) => JSX.Element
	serverPaths(): Promise<{ path: string; props: Props }[]>
}

// PageModule describes a page module.
export type PageModule = StaticPageModule | DynamicPageModule

// LoadedRouteMeta describes a loaded server-resolved route (from __cache__).
export interface LoadedRouteMeta {
	mod: StaticPageModule | DynamicPageModule
	meta: RouteMeta
}
