package cli

// TODO: Add command enum.

type StartCommand struct {
	Cached    bool
	Port      int
	SourceMap bool
}

type BuildCommand struct {
	Cached    bool
	SourceMap bool
}

type ServeCommand struct {
	Port int
}
