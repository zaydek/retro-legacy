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
export interface DirConfiguration {
	publicDir: string
	srcPagesDir: string
	cacheDir: string
	exportDir: string
}

// Runtime a meta data structure for the runtime.
export interface Runtime<Cmd = Command> {
	cmd: Cmd
	dir: DirConfiguration
	// filesystemRouter: ...
}

////////////////////////////////////////////////////////////////////////////////

// dev handles 'retro dev [flags]'.
export type dev = (runtime: Runtime<DevCommand>) => Promise<void>

// export_ handles 'retro export [flags]'.
export type export_ = (runtime: Runtime<ExportCommand>) => Promise<void>

// serve handles 'retro serve [flags]'.
export type serve = (runtime: Runtime<ServeCommand>) => Promise<void>
