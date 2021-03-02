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

export type DescriptProps = Props & { path: string }

// prettier-ignore
export interface RouteInfo {
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

export type PageModule = StaticPageModule | DynamicPageModule

export interface RouteMeta {
	routeInfo: RouteInfo
	descriptProps: DescriptProps
}

export interface Router {
	[key: string]: RouteMeta
}

export interface Runtime<CommandKind extends Command = Command> {
	command: CommandKind
	directories: Directories
	document: string
	pageInfos: PageInfo[]
	router: Router
	guards(): Promise<void>
	resolveDocument(): Promise<void>
	resolvePages(): Promise<void>
	resolveRouter(): Promise<void>
	purgeCacheDirectory(): Promise<void>
	purgeExportDirectory(): Promise<void>
}
