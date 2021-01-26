package main

import "time"

// CreateCommandFlags describes retro create flags.
type CreateCommandFlags struct {
	Language string
}

// WatchCommandFlags describes retro watch flags.
type WatchCommandFlags struct {
	Directories []string
	Poll        time.Duration
	Port        int
}

// BuildCommandFlags describes retro build flags.
type BuildCommandFlags struct {
	Cached bool
}

// ServeCommandFlags describes retro serve flags.
type ServeCommandFlags struct {
	Port int
}
