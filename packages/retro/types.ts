// CmdDev describes the 'retro dev' command.
export interface CmdDev {
	cached: boolean
	sourcemap: boolean
	port: number
}

// CmdExport describes the 'retro export' command.
export interface CmdExport {
	cached: boolean
	sourcemap: boolean
}

// CmdServe describes the 'retro serve' command.
export interface CmdServe {
	port: number
}

export type Cmd = CmdDev | CmdExport | CmdServe
