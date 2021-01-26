package main

import (
	"fmt"
	"os"

	"github.com/zaydek/retro/cli"
	"github.com/zaydek/retro/loggers"
)

// getPort gets the current port.
func (r Runtime) getPort() int {
	if r.WatchCommand != nil {
		return r.WatchCommand.Port
	} else if r.ServeCommand != nil {
		return r.ServeCommand.Port
	}
	return 0
}

// loadRuntime loads the runtime; parses CLI arguments, configuration, and the
// page-based routes.
func loadRuntime() Runtime {
	var err error

	var runtime Runtime
	runtime.Commands = cli.ParseCLIArguments()
	if runtime.Config, err = loadConfig(); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	if runtime.Router, err = loadRouter(runtime.Config); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	return runtime
}

// buildRequireStmt builds a require statement for Node processes.
func buildRequireStmt(routes []PageBasedRoute) string {
	var requireStmt string
	for x, each := range routes {
		var sep string
		if x > 0 {
			sep = "\n"
		}
		requireStmt += sep + fmt.Sprintf(`const %s = require("../%s")`,
			each.Component, each.FSPath)
	}
	return requireStmt
}

// buildRequireStmtAsArray builds a require statement as an array for Node
// processes.
func buildRequireStmtAsArray(routes []PageBasedRoute) string {
	var requireStmtAsArray string
	for _, each := range routes {
		requireStmtAsArray += "\n\t" + fmt.Sprintf(`{ fs_path: %q, path: %q, exports: %s },`,
			each.FSPath, each.Path, each.Component)
	}
	requireStmtAsArray = "[" + requireStmtAsArray + "\n]"
	return requireStmtAsArray
}
