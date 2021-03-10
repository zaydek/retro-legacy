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
	port: number
}

export type AnyCommand = DevCommand | ExportCommand | ServeCommand

////////////////////////////////////////////////////////////////////////////////

// prettier-ignore
export interface Directories {
	wwwDir: string      // e.g. "www"
	srcPagesDir: string // e.g. "src/pages"
	cacheDir: string    // e.g. "__cache__"
	exportDir: string   // e.g. "__export__"
}

////////////////////////////////////////////////////////////////////////////////

export interface Props {
	[key: string]: unknown
}

export type DescriptProps = Props & { path: string }

// prettier-ignore
export interface FSPageInfo {
	type: "static" | "dynamic"
	src: string       // e.g. "src/pages/index.js"
	component: string // e.g. "PageIndex"
}

// prettier-ignore
export interface ServerRouteInfo {
	type: "static" | "dynamic"
	src: string       // e.g. "src/pages/index.js"
	dst: string       // e.g. "dst/index.html"
	path: string      // e.g. "/"
	component: string // e.g. "PageIndex"
}

export interface StaticPageModule {
	Head?: (props: DescriptProps) => JSX.Element
	default?: (props: DescriptProps) => JSX.Element
	serverProps?(): Promise<Props>
}

export interface DynamicPageModule {
	Head?: (props: DescriptProps) => JSX.Element
	default?: (props: DescriptProps) => JSX.Element
	serverPaths(): Promise<{ path: string; props: Props }[]>
}

export type AnyPageModule = StaticPageModule | DynamicPageModule

export interface RouteMeta {
	module: AnyPageModule
	pageInfo: FSPageInfo
	routeInfo: ServerRouteInfo
	descriptProps: DescriptProps
}

export interface Router {
	[key: string]: RouteMeta
}

export interface Runtime<Cmd extends AnyCommand = AnyCommand> {
	cmd: Cmd
	dirs: Directories
	tmpl: string
	pages: FSPageInfo[]
	router: Router
	serverGuards(): Promise<void>
	purge(): Promise<void>
	resolveDocument(): Promise<void>
	resolvePages(): Promise<void>
	resolveRouter(): Promise<void>
}
