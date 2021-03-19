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
	SrvRouter: ServerRouter
}

////////////////////////////////////////////////////////////////////////////////

export interface StaticModule {
	serverProps?(): Promise<Props>
	Head?: (props: ServerProps) => JSX.Element
	default: (props: ServerProps) => JSX.Element
}

export interface DynamicModule {
	serverPaths(): Promise<{ path: string; props: Props }[]>
	Head?: (props: ServerProps) => JSX.Element
	default: (props: ServerProps) => JSX.Element
}

export type AnyModule = StaticModule | DynamicModule

////////////////////////////////////////////////////////////////////////////////

export type Props = { [key: string]: unknown }

export type ServerProps = Props & { path: string }

export interface ServerRoute {
	Route: Route & { Target: string; Pathname: string }
	Props: ServerProps
}

export interface ServerRouter {
	[key: string]: ServerRoute
}

////////////////////////////////////////////////////////////////////////////////

export interface Message {
	Kind?: string
	Data?: any
}
