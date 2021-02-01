package cli

type WatchCommand struct {
	// Flags
	Cached    bool
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
