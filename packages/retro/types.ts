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
	publicDir:   string // e.g. "public"
	srcPagesDir: string // e.g. "src/pages"
	cacheDir:    string // e.g. "__cache__"
	exportDir:   string // e.g. "__export__"
}

// StaticPageMeta describes static page metadata.
// prettier-ignore
export interface StaticPageMeta {
	type:      "static"
	src:       string // e.g. "src/pages/index.js"
	dst:       string // e.g. "dst/index.html"
	path:      string // e.g. "/"
	component: string // e.g. "PageIndex"
}

// DynamicPageMeta describes dynamic page metadata.
// prettier-ignore
export interface DynamicPageMeta {
	type:      "dynamic"
	src:       string // e.g. "src/pages/[index].js"
	component: string // e.g. "DynamicPageIndex"
}

export type PageMeta = StaticPageMeta | DynamicPageMeta

// Runtime a meta data structure for the runtime.
export interface Runtime<Cmd = Command> {
	command: Cmd
	directories: DirConfiguration
	document: string
	pages: PageMeta[]
}

////////////////////////////////////////////////////////////////////////////////

// Props describes runtime props.
export type Props = { [key: string]: unknown }

// DescriptServerProps describes runtime props resolved on the server.
export type ServerResolvedProps = Props & { path: string }

// StaticPageModule describes a static page module.
export interface StaticPageModule {
	Head?: (props: ServerResolvedProps) => JSX.Element
	default?: (props: ServerResolvedProps) => JSX.Element
	serverProps?(): Promise<ServerResolvedProps>
}

// DynamicPageModule describes a dynamic page module.
export interface DynamicPageModule {
	Head?: (props: ServerResolvedProps) => JSX.Element
	default?: (props: ServerResolvedProps) => JSX.Element
	serverPaths(): Promise<{ path: string; props: Props }[]>
}

// LoadedServerRoute describes a loaded server route (from __cache__).
export interface LoadedServerRouteMeta {
	meta: ServerRouteMeta
	module: StaticPageModule | DynamicPageModule
}

// prettier-ignore
export interface ServerRoute {
	type:      "static" | "dynamic"
	src:       string // e.g. "src/pages/index.js"
	dst:       string // e.g. "dst/index.html"
	path:      string // e.g. "/"
	component: string // e.g. "PageIndex"
}

export interface ServerRouteMeta {
	route: ServerRoute
	props: ServerResolvedProps
}

export interface ServerRouter {
	[key: string]: ServerRouteMeta
}
