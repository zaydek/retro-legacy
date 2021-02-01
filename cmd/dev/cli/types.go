package cli

type StartCommand struct {
	// Flags
	Cached    bool
	Port      int
	SourceMap bool
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
