package cli

import "time"

// CreateCommandFlags describes retro create flags and arguments.
type CreateCommandFlags struct {
	// Flags
	Language string

	// Arguments
	Directory string
}

// WatchCommandFlags describes retro watch flags and arguments.
type WatchCommandFlags struct {
	// Flags
	Poll time.Duration
	Port int

	// Arguments
	Directories []string
}

// BuildCommandFlags describes retro build flags and arguments.
type BuildCommandFlags struct {
	// Flags
	Cached bool
}

// ServeCommandFlags describes retro serve flags and arguments.
type ServeCommandFlags struct {
	// Flags
	Port int
}

type Commands struct {
	CreateCommand *CreateCommandFlags
	WatchCommand  *WatchCommandFlags
	BuildCommand  *BuildCommandFlags
	ServeCommand  *ServeCommandFlags
}
