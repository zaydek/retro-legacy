package cli

import (
	"fmt"
	"os"
	"regexp"
	"strconv"
	"strings"

	"github.com/zaydek/retro/pkg/logger"
	"github.com/zaydek/retro/pkg/terminal"
)

type ErrorKind int

const (
	BadCmdArgument ErrorKind = iota
	BadArgument
	BadFlag
	BadPort
)

type CmdError struct {
	Kind ErrorKind

	BadCmdArgument string
	BadArgument    string
	BadFlag        string
	BadPort        int

	Err error
}

var dim = terminal.Dim.Sprint

func (e CmdError) Error() string {
	switch e.Kind {
	case BadCmdArgument:
		return fmt.Sprintf(`Unrecognized command '%s'.

Supported commands:

`+dim("-")+` retro dev     Start the dev server
`+dim("-")+` retro export  Export the production-ready build
`+dim("-")+` retro serve   Serve the production-ready build

`,
			e.BadCmdArgument)
	case BadArgument:
		return fmt.Sprintf("Unrecognized argument '%s'.",
			e.BadArgument)
	case BadFlag:
		return fmt.Sprintf("Unrecognized flag '%s'.",
			e.BadFlag)
	case BadPort:
		return fmt.Sprintf("'--port' must be between '1000' and '10000'; used '%d'.",
			e.BadPort)
	}
	panic("Internal error")
}

func (e CmdError) Unwrap() error {
	return e.Err
}

var portRegex = regexp.MustCompile(`^--port=(\d+)$`)

func parseDevCmd(args ...string) (DevCmd, error) {
	cmd := DevCmd{
		Cached:      false,
		FastRefresh: true,
		Sourcemap:   true,
		Port:        8000,
	}
	for _, arg := range args {
		// Prepare a bad command error
		cmdErr := CmdError{Kind: BadFlag, BadFlag: arg}
		if strings.HasPrefix(arg, "--cached") {
			if arg == "--cached" {
				cmd.Cached = true
			} else if arg == "--cached=true" || arg == "--cached=false" {
				cmd.Cached = arg == "--cached=true"
			} else {
				return DevCmd{}, cmdErr
			}
		} else if strings.HasPrefix(arg, "--fast-refresh") {
			if arg == "--fast-refresh" {
				cmd.FastRefresh = true
			} else if arg == "--fast-refresh=true" || arg == "--fast-refresh=false" {
				cmd.FastRefresh = arg == "--fast-refresh=true"
			} else {
				return DevCmd{}, cmdErr
			}
		} else if strings.HasPrefix(arg, "--port") {
			matches := portRegex.FindStringSubmatch(arg)
			if len(matches) == 2 {
				cmd.Port, _ = strconv.Atoi(matches[1])
			} else {
				return DevCmd{}, cmdErr
			}
		} else if strings.HasPrefix(arg, "--sourcemap") {
			if arg == "--sourcemap" {
				cmd.Sourcemap = true
			} else if arg == "--sourcemap=true" || arg == "--sourcemap=false" {
				cmd.Sourcemap = arg == "--sourcemap=true"
			} else {
				return DevCmd{}, cmdErr
			}
		} else {
			return DevCmd{}, CmdError{Kind: BadFlag, BadFlag: arg}
		}
	}
	if cmd.Port < 1_000 || cmd.Port >= 10_000 {
		return DevCmd{}, CmdError{Kind: BadPort, BadPort: cmd.Port}
	}
	return cmd, nil
}

func parseExportCmd(args ...string) (ExportCmd, error) {
	cmd := ExportCmd{
		Cached:    false,
		Sourcemap: true,
	}
	for _, arg := range args {
		// Prepare a bad command error
		cmdErr := CmdError{Kind: BadFlag, BadFlag: arg}
		if strings.HasPrefix(arg, "--cached") {
			if arg == "--cached" {
				cmd.Cached = true
			} else if arg == "--cached=true" || arg == "--cached=false" {
				cmd.Cached = arg == "--cached=true"
			} else {
				return ExportCmd{}, cmdErr
			}
		} else if strings.HasPrefix(arg, "--sourcemap") {
			if arg == "--sourcemap" {
				cmd.Sourcemap = true
			} else if arg == "--sourcemap=true" || arg == "--sourcemap=false" {
				cmd.Sourcemap = arg == "--sourcemap=true"
			} else {
				return ExportCmd{}, cmdErr
			}
		} else {
			return ExportCmd{}, CmdError{Kind: BadFlag, BadFlag: arg}
		}
	}
	return cmd, nil
}

func parseServeCmd(args ...string) (ServeCmd, error) {
	cmd := ServeCmd{
		Port: 8000,
	}
	for _, arg := range args {
		// Prepare a bad command error
		cmdErr := CmdError{Kind: BadFlag, BadFlag: arg}
		if strings.HasPrefix(arg, "--port") {
			matches := portRegex.FindStringSubmatch(arg)
			if len(matches) == 2 {
				cmd.Port, _ = strconv.Atoi(matches[1])
			} else {
				return ServeCmd{}, cmdErr
			}
		} else {
			return ServeCmd{}, CmdError{Kind: BadFlag, BadFlag: arg}
		}
	}
	if cmd.Port < 1_000 || cmd.Port >= 10_000 {
		return ServeCmd{}, CmdError{Kind: BadPort, BadPort: cmd.Port}
	}
	return cmd, nil
}

func ParseCLIArguments() (interface{}, error) {
	// Guard '% retro'
	if len(os.Args) == 1 {
		fmt.Println("\n" + logger.Transform(usage, terminal.Cyan.Sprint) + "\n")
		os.Exit(0)
	}

	var cmd interface{}
	var cmdErr error

	if cmdArg := os.Args[1]; cmdArg == "version" || cmdArg == "--version" || cmdArg == "--v" {
		fmt.Println(os.Getenv("RETRO_VERSION"))
		os.Exit(0)
	} else if cmdArg == "usage" || cmdArg == "--usage" || cmdArg == "help" || cmdArg == "--help" {
		fmt.Println("\n" + logger.Transform(usage, terminal.Cyan.Sprint) + "\n")
		os.Exit(0)
	} else if cmdArg == "dev" {
		os.Setenv("__DEV__", "true")
		os.Setenv("NODE_ENV", "development")
		cmd, cmdErr = parseDevCmd(os.Args[2:]...)
	} else if cmdArg == "export" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd, cmdErr = parseExportCmd(os.Args[2:]...)
	} else if cmdArg == "serve" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd, cmdErr = parseServeCmd(os.Args[2:]...)
	} else {
		cmdErr = CmdError{Kind: BadCmdArgument, BadCmdArgument: cmdArg}
	}
	return cmd, cmdErr
}
