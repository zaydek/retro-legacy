// DevCommand describes the 'retro dev [flags]' command.
export interface DevCommand {
	type: "dev"
	cached: boolean
	sourcemap: boolean
	port: number
}

// ExportCommand describes the 'retro export [flags]' command.
export interface ExportCommand {
	type: "export"
	cached: boolean
	sourcemap: boolean
}

// ServeCommand describes the 'retro serve [flags]' command.
export interface ServeCommand {
	type: "serve"
	mode: "spa" | "ssg"
	port: number
}

export type Command = DevCommand | ExportCommand | ServeCommand

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

// prettier-ignore
export interface ServerRoute {
	type:      "static" | "dynamic"
	src:       string // e.g. "src/pages/index.js"
	dst:       string // e.g. "dst/index.html"
	path:      string // e.g. "/"
	component: string // e.g. "PageIndex"
}

export interface RouteMeta {
	route: ServerRoute
	props: ServerResolvedProps
}

export interface Router {
	[key: string]: RouteMeta
}

////////////////////////////////////////////////////////////////////////////////

// cmd_dev handles 'retro dev [flags]'.
export type cmd_dev = (runtime: Runtime<DevCommand>) => Promise<void>

// cmd_export handles 'retro export [flags]'.
export type cmd_export = (runtime: Runtime<ExportCommand>) => Promise<void>

// cmd_serve handles 'retro serve [flags]'.
export type cmd_serve = (runtime: Runtime<ServeCommand>) => Promise<void>
