package cli

import "time"

// CreateCommandFlags describes retro create flags and arguments.
type CreateCommandFlags struct {
	Template string

	// Arguments
	Directory string
}

// WatchCommandFlags describes retro watch flags and arguments.
type WatchCommandFlags struct {
	Cached    bool
	Poll      time.Duration
	Port      int
	SourceMap bool

	// Arguments
	//
	// TODO: Change to directories.
	Directory string
}

// BuildCommandFlags describes retro build flags and arguments.
type BuildCommandFlags struct {
	Cached    bool
	SourceMap bool
}

// ServeCommandFlags describes retro serve flags and arguments.
type ServeCommandFlags struct {
	Port int
}

type Commands struct {
	CreateCommand *CreateCommandFlags
	WatchCommand  *WatchCommandFlags
	BuildCommand  *BuildCommandFlags
	ServeCommand  *ServeCommandFlags
}
