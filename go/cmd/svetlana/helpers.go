package svetlana

import (
	"strconv"

	"github.com/zaydek/svetlana/cmd/svetlana/cli"
	"github.com/zaydek/svetlana/pkg/loggers"
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
	case cli.StartCommand:
		return CmdStart
	case cli.BuildCommand:
		return CmdBuild
	case cli.ServeCommand:
		return CmdServe
	}
	return 0
}

// // getSourceMap gets the current source map enum.
// func (r Runtime) getSourceMap() api.SourceMap {
// 	if cmd := r.getCmd(); cmd == CmdStart {
// 		if r.Command.(cli.StartCommand).SourceMap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	} else if cmd == CmdBuild {
// 		if r.Command.(cli.BuildCommand).SourceMap {
// 			return api.SourceMapLinked
// 		}
// 		return api.SourceMapNone
// 	}
// 	return 0
// }

// getPort gets the current port.
func (r Runtime) getPort() string {
	if cmd := r.getCmd(); cmd == CmdStart {
		return strconv.Itoa(r.Command.(cli.StartCommand).Port)
	} else if cmd == CmdServe {
		return strconv.Itoa(r.Command.(cli.ServeCommand).Port)
	}
	return ""
}
