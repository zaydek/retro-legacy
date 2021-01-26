package cli

import "time"

type CreateCommandFlags struct {
	Language string
}

type WatchCommandFlags struct {
	Poll time.Duration
	Port int

	Directories []string
}

type BuildCommandFlags struct {
	Cached bool
}

type ServeCommandFlags struct {
	Port int
}

type Commands struct {
	CreateCommand *CreateCommandFlags
	WatchCommand  *WatchCommandFlags
	BuildCommand  *BuildCommandFlags
	ServeCommand  *ServeCommandFlags
}
