package main

import (
	"strconv"

	"github.com/zaydek/retro/cmd/retro/cli"
)

type CmdKind uint8

const (
	DevCmd CmdKind = iota
	ExportCmd
	ServeCmd
)

// func must(err error) {
// 	if err == nil {
// 		// No-op
// 		return
// 	}
// 	loggers.ErrorAndEnd(err)
// }

func (r Runtime) getCmd() (ret CmdKind) {
	switch r.Cmd.(type) {
	case cli.DevCmd:
		return DevCmd
	case cli.ExportCmd:
		return ExportCmd
	case cli.ServeCmd:
		return ServeCmd
	}
	// Return zero value
	return
}

func (r Runtime) getCmdName() (ret string) {
	switch r.getCmd() {
	case DevCmd:
		return "dev"
	case ExportCmd:
		return "export"
	case ServeCmd:
		return "serve"
	}
	// Return zero value
	return
}

func (r Runtime) getPort() (ret string) {
	if cmd := r.getCmd(); cmd == DevCmd {
		return strconv.Itoa(r.Cmd.(cli.DevCmd).Port)
	} else if cmd == ServeCmd {
		return strconv.Itoa(r.Cmd.(cli.ServeCmd).Port)
	}
	// Return zero value
	return
}
