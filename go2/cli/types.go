package cli

import "time"

// CreateCommandFlags describes retro create flags and arguments.
type CreateCommandFlags struct {
	Language string
}

// WatchCommandFlags describes retro watch flags and arguments.
type WatchCommandFlags struct {
	Poll time.Duration
	Port int

	Directories []string
}

// BuildCommandFlags describes retro build flags and arguments.
type BuildCommandFlags struct {
	Cached bool
}

// ServeCommandFlags describes retro serve flags and arguments.
type ServeCommandFlags struct {
	Port int
}

// Commands describe the aggregate command flags and arguments. Uses references
// so unused commands are nil.
type Commands struct {
	CreateCommand *CreateCommandFlags
	WatchCommand  *WatchCommandFlags
	BuildCommand  *BuildCommandFlags
	ServeCommand  *ServeCommandFlags
}
