package main

import (
	"os"
	p "path"
	"strconv"

	"github.com/zaydek/retro/cmd/retro/cli"
)

// func must(err error) {
// 	if err == nil {
// 		// No-op
// 		return
// 	}
// 	loggers.ErrorAndEnd(err)
// }

// getAppName gets the cwd basename.
func getAppName() string {
	cwd, _ := os.Getwd()
	return p.Base(cwd)
}

func (r Runtime) getCmdType() CmdKind {
	switch r.Command.(type) {
	case cli.DevCommand:
		return DevCmd
	case cli.ExportCommand:
		return ExportCmd
	case cli.ServeCommand:
		return ServeCmd
	}
	return 0
}

func (r Runtime) getCmdName() string {
	switch r.getCmdType() {
	case DevCmd:
		return "dev"
	case ExportCmd:
		return "export"
	case ServeCmd:
		return "serve"
	}
	return ""
}

// func (r Runtime) getSourceMap() api.SourceMap {
// 	if cmd := r.getCmdType(); cmd == DevCmd {
// 		if r.Command.(cli.DevCommand).Sourcemap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	} else if cmd == ExportCmd {
// 		if r.Command.(cli.ExportCommand).Sourcemap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	}
// 	return 0
// }

func (r Runtime) getPort() string {
	if cmd := r.getCmdType(); cmd == DevCmd {
		return strconv.Itoa(r.Command.(cli.DevCommand).Port)
	} else if cmd == ServeCmd {
		return strconv.Itoa(r.Command.(cli.ServeCommand).Port)
	}
	return ""
}
