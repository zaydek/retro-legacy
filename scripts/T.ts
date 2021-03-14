export interface DevCmd {
	Cached: boolean
	FastRefresh: boolean
	Port: number
	Sourcemap: boolean
}

export interface ExportCmd {
	Cached: boolean
	Sourcemap: boolean
}

export interface ServeCmd {
	Port: number
}

export type AnyCmd = DevCmd | ExportCmd | ServeCmd

export interface Dirs {
	CacheDir: string
	ExportDir: string
	SrcPagesDir: string
	WwwDir: string
}

export interface Route {
	Type: "static" | "dynamic"
	Source: string
	ComponentName: string
}

export interface Runtime {
	Cmd: AnyCmd
	Dirs: Dirs
	Template: string
	Routes: Route[]
}

////////////////////////////////////////////////////////////////////////////////

export type Props = { [key: string]: unknown }

export type RouteProps = Props & { path: string }

export interface RouteMeta {
	Route: Route
	RouteProps: RouteProps
}

export interface Router {
	[key: string]: RouteMeta
}

export interface StaticModule {
	serverProps?(): Promise<Props>
	Head?: (props: RouteProps) => JSX.Element
	default: (props: RouteProps) => JSX.Element
}

export interface DynamicModule {
	serverPaths(): Promise<{ path: string; props: Props }[]>
	Head?: (props: RouteProps) => JSX.Element
	default: (props: RouteProps) => JSX.Element
}

export type AnyModule = StaticModule | DynamicModule
