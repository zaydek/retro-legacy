package main

import (
	"strconv"

	"github.com/zaydek/retro/cmd/retro/cli"
)

type CmdKind uint8

const (
	Dev CmdKind = iota
	Export
	Serve
)

// func must(err error) {
// 	if err == nil {
// 		// No-op
// 		return
// 	}
// 	loggers.ErrorAndEnd(err)
// }

func (r Runtime) getCmdKind() (ret CmdKind) {
	switch r.Cmd.(type) {
	case cli.DevCmd:
		return Dev
	case cli.ExportCmd:
		return Export
	case cli.ServeCmd:
		return Serve
	}
	return
}

// func (r Runtime) getCmdName() (ret string) {
// 	switch r.getCmd() {
// 	case DevCmd:
// 		return "dev"
// 	case ExportCmd:
// 		return "export"
// 	case ServeCmd:
// 		return "serve"
// 	}
// 	return
// }

func (r Runtime) getPort() (ret string) {
	if cmd := r.getCmdKind(); cmd == Dev {
		return strconv.Itoa(r.Cmd.(cli.DevCmd).Port)
	} else if cmd == Serve {
		return strconv.Itoa(r.Cmd.(cli.ServeCmd).Port)
	}
	return
}
