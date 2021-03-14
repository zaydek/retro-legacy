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
