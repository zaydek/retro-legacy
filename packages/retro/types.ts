// DevCommand describes the 'retro dev' command.
export interface DevCommand {
	type: "dev"
	cached: boolean
	sourcemap: boolean
	port: number
}

// ExportCommand describes the 'retro export' command.
export interface ExportCommand {
	type: "export"
	cached: boolean
	sourcemap: boolean
}

// ServeCommand describes the 'retro serve' command.
export interface ServeCommand {
	type: "serve"
	mode: "spa" | "ssg"
	port: number
}

export type Command = DevCommand | ExportCommand | ServeCommand

export type DevOrExportCommand = DevCommand | ExportCommand

////////////////////////////////////////////////////////////////////////////////

// DirConfiguration describes the directory configuration.
// prettier-ignore
export interface DirConfiguration {
	publicDir: string   // e.g. "public"
	srcPagesDir: string // e.g. "src/pages"
	cacheDir: string    // e.g. "__cache__"
	exportDir: string   // e.g. "__export__"
}

// StaticPageInfo describes static page metadata.
// prettier-ignore
export interface StaticPageInfo {
	type: "static"
	src: string       // e.g. "src/pages/index.js"
	dst: string       // e.g. "dst/index.html"
	path: string      // e.g. "/"
	component: string // e.g. "PageIndex"
}

// DynamicPageInfo describes dynamic page metadata.
// prettier-ignore
export interface DynamicPageInfo {
	type: "dynamic"
	src: string       // e.g. "src/pages/[index].js"
	component: string // e.g. "DynamicPageIndex"
}

export type PageInfo = StaticPageInfo | DynamicPageInfo

export interface Runtime<Cmd = Command> {
	command: Cmd
	directories: DirConfiguration
	document: string
	pages: PageInfo[]
}

////////////////////////////////////////////////////////////////////////////////

// Props describes runtime props ambiguously.
export type Props = { [key: string]: unknown }

// DescriptServerProps describes runtime props resolved on the server.
export type RouteProps = Props & { path: string }

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

// Route describes a server-resolved route.
// prettier-ignore
export interface Route {
	type: "static" | "dynamic"
	src: string       // e.g. "src/pages/index.js"
	dst: string       // e.g. "dst/index.html"
	path: string      // e.g. "/"
	component: string // e.g. "PageIndex"
}

// RouteMeta describes a server-resolved route metadata.
export interface RouteMeta {
	route: Route
	props: RouteProps
}

// LoadedRouteMeta describes a loaded server-resolved route (from __cache__).
export interface LoadedRouteMeta {
	meta: RouteMeta
	module: StaticPageModule | DynamicPageModule
}

// Router describes the server-resolved route.
export interface Router {
	[key: string]: RouteMeta
}
