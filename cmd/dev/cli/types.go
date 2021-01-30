package cli

import "time"

type WatchCommand struct {
	// Flags
	Cached    bool
	Poll      time.Duration
	Port      int
	SourceMap bool

	// Arguments
	Paths []string
}

type BuildCommand struct {
	// Flags
	Cached    bool
	SourceMap bool
}

type ServeCommand struct {
	// Flags
	Port int
}
