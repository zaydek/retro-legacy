package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/retro/pkg/pretty"
)

type ErrorKind int

const (
	BadCmdArgument ErrorKind = iota
	BadArguments
	BadCommand
	BadPort
)

type CmdError struct {
	Kind ErrorKind

	BadCmdArgument string
	BadArguments   []string
	BadCommand     string
	BadPort        int

	Err error
}

func (e CmdError) Error() string {
	switch e.Kind {
	case BadCmdArgument:
		return fmt.Sprintf("Unrecognized command argument '%s'.",
			e.BadCmdArgument)
	case BadArguments:
		return fmt.Sprintf("Unrecognized arguments '%s'.",
			pretty.PoorManJSON(e.BadArguments))
	case BadCommand:
		return fmt.Sprintf("Unrecognized command '%s'.",
			e.BadCommand)
	case BadPort:
		return fmt.Sprintf("'--port' must be between '1000' and '10000'; port used '%d'.",
			e.BadPort)
	}
	panic("Internal error")
}

func (e CmdError) Unwrap() error {
	return e.Err
}

func validatePort(n int) bool {
	return n < 1e3 || n >= 1e4
}

func parseDevArgs(args ...string) (DevCmd, error) {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := DevCmd{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.FastRefresh, "fast-refresh", true, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.Sourcemap, "sourcemap", true, "")
	if err := flagset.Parse(args); err != nil {
		return DevCmd{}, CmdError{Kind: BadArguments, BadArguments: args, Err: err}
	}
	if !validatePort(cmd.Port) {
		return DevCmd{}, CmdError{Kind: BadPort, BadPort: cmd.Port}
	}
	return cmd, nil
}

func parseExportArgs(args ...string) (ExportCmd, error) {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ExportCmd{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.Sourcemap, "sourcemap", true, "")
	if err := flagset.Parse(args); err != nil {
		return ExportCmd{}, CmdError{Kind: BadArguments, BadArguments: args, Err: err}
	}
	return cmd, nil
}

func parseServeArgs(args ...string) (ServeCmd, error) {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ServeCmd{}
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	if err := flagset.Parse(args); err != nil {
		return ServeCmd{}, CmdError{Kind: BadArguments, BadArguments: args, Err: err}
	}
	if !validatePort(cmd.Port) {
		return ServeCmd{}, CmdError{Kind: BadPort, BadPort: cmd.Port}
	}
	return cmd, nil
}

func ParseCLIArguments() (interface{}, error) {
	// Guard '% retro'
	if len(os.Args) == 1 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd interface{}
	var err error

	if cmdArg := os.Args[1]; cmdArg == "version" || cmdArg == "--version" || cmdArg == "--v" {
		fmt.Println(os.Getenv("RETRO_VERSION"))
		os.Exit(0)
	} else if cmdArg == "usage" || cmdArg == "--usage" || cmdArg == "help" || cmdArg == "--help" {
		fmt.Println(usage)
		os.Exit(0)
	} else if cmdArg == "dev" {
		os.Setenv("__DEV__", "true")
		os.Setenv("NODE_ENV", "development")
		cmd, err = parseDevArgs(os.Args[2:]...)
	} else if cmdArg == "export" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd, err = parseExportArgs(os.Args[2:]...)
	} else if cmdArg == "serve" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd, err = parseServeArgs(os.Args[2:]...)
	} else {
		err = CmdError{Kind: BadCmdArgument, BadCmdArgument: cmdArg}
	}
	return cmd, err
}
