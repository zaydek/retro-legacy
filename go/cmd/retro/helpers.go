package retro

import (
	"strconv"

	"github.com/zaydek/retro/cmd/retro/cli"
	"github.com/zaydek/retro/pkg/loggers"
)

func must(err error) {
	if err == nil {
		// No-op
		return
	}
	loggers.ErrorAndEnd(err)
}

// getCmd gets the current command.
func (r Runtime) getCmd() Cmd {
	switch r.Command.(type) {
	case cli.DevCommand:
		return CmdDev
	case cli.ExportCommand:
		return CmdExport
	case cli.ServeCommand:
		return CmdServe
	}
	return 0
}

// getCmdName gets the current command name.
func (r Runtime) getCmdName() string {
	switch r.getCmd() {
	case CmdDev:
		return "dev"
	case CmdExport:
		return "export"
	case CmdServe:
		return "serve"
	}
	return ""
}

// // getSourceMap gets the current source map enum.
// func (r Runtime) getSourceMap() api.SourceMap {
// 	if cmd := r.getCmd(); cmd == CmdDev {
// 		if r.Command.(cli.DevCommand).SourceMap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	} else if cmd == CmdExport {
// 		if r.Command.(cli.ExportCommand).SourceMap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	}
// 	return 0
// }

// getPort gets the current port.
func (r Runtime) getPort() string {
	if cmd := r.getCmd(); cmd == CmdDev {
		return strconv.Itoa(r.Command.(cli.DevCommand).Port)
	} else if cmd == CmdServe {
		return strconv.Itoa(r.Command.(cli.ServeCommand).Port)
	}
	return ""
}
