// CmdDev describes the 'retro dev' command.
export interface CmdDev {
	type: "dev"
	cached: boolean
	sourcemap: boolean
	port: number
}

// CmdExport describes the 'retro export' command.
export interface CmdExport {
	type: "export"
	cached: boolean
	sourcemap: boolean
}

// CmdServe describes the 'retro serve' command.
export interface CmdServe {
	type: "serve"
	port: number
}

export type Cmd = CmdDev | CmdExport | CmdServe

// dev handles 'retro dev'.
export type dev = (cmd: CmdDev) => void

// export_ handles 'retro export'.
export type export_ = (cmd: CmdExport) => void

// serve handles 'retro serve'.
export type serve = (cmd: CmdServe) => void
