// Props describes props ambiguously.
export type Props = { [key: string]: any }

// DescriptiveServerProps describes props ambiguously and the current path.
export type DescriptiveServerProps = Props & { path: string }

// ServerRouter describes the server-resolved router.
export interface ServerRouter {
	// The static or server-resolved dynamic path. Static paths are inferred from
	// filenames and dynamic paths are inferred by [dynamic] filenames and
	// resolving serverPaths.
	[key: string]: {
		route: FilesystemRoute
		props: DescriptiveServerProps
	}
}

////////////////////////////////////////////////////////////////////////////////

// PageModule ambiguously describes a page module.
interface PageModule {
	Head?: (resolvedProps: DescriptiveServerProps) => JSX.Element
	default?: (resolvedProps: DescriptiveServerProps) => JSX.Element
}

// StaticPageModule describes a static page module.
export interface StaticPageModule extends PageModule {
	serverProps: Promise<DescriptiveServerProps>
}

export type DescriptiveServerPaths = { path: string; props?: Props }[]

// DynamicPageModule describes a dynamic page module.
export interface DynamicPageModule extends PageModule {
	serverPaths: Promise<DescriptiveServerPaths>
}

////////////////////////////////////////////////////////////////////////////////

// DevCommand describes 'retro dev ...'.
// prettier-ignore
export interface DevCommand {
	cached: boolean    // retro dev --cached
	sourcemap: boolean // retro dev --sourcemap
	port: number       // retro dev --port
}

// ExportCommand describes 'retro export ...'.
// prettier-ignore
export interface ExportCommand {
	cached: boolean    // retro export --cached
	sourcemap: boolean // retro export --sourcemap
}

// DirConfiguration describes directory configuration.
// prettier-ignore
export interface DirectoryConfiguration {
	publicDir: string // e.g. "public"
	pagesDir: string  // e.g. "src/pages"
	cacheDir: string  // e.g. "__cache__"
	exportDir: string // e.g. "__export__"
}

// FilesystemRoute describes a page-based route.
// prettier-ignore
export interface FilesystemRoute {
	inputPath: string  // e.g. "src/pages/index.js"
	outputPath: string // e.g. "index.html"
	path: string       // e.g. "/"
	component: string  // e.g. "PageIndex"
}

// Runtime describes the runtime emitted from the Go backend.
export interface Runtime {
	command: DevCommand | ExportCommand
	directoryConfiguration: DirectoryConfiguration
	filesystemRouter: FilesystemRoute[]
	baseHTML: string
}
