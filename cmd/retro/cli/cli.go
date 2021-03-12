package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/retro/pkg/json2"
)

type ErrorKind int

const (
	BadCommand ErrorKind = iota
	BadArgument
	BadPort
)

type CmdError struct {
	Kind ErrorKind

	Arguments   []string
	BadCommand  string
	BadArgument string
	BadPort     string // TODO: Change to int?
	Err         error
}

func (e CmdError) Error() string {

	switch e.Kind {
	case BadCommand:
		return fmt.Sprintf("Unrecognized flags and or arguments; original arguments '%s'",
			json2.PoorMansFormat(e.Arguments))
	case BadArgument:
		return fmt.Sprintf("")
	case BadPort:
		return fmt.Sprintf("")
	}
	panic("unknown ErrorKind")
}

func (e CmdError) Unwrap() error {
	return e.Err
}

func parseDevArgs(args ...string) DevCmd {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := DevCmd{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.FastRefresh, "fast-refresh", true, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.Sourcemap, "sourcemap", true, "")
	if err := flagset.Parse(args); err != nil {
		// loggers.Error("Unrecognized flags and or arguments. " +
		// 	"Try retro help for help.")
		// os.Exit(2)
	}
	if cmd.Port < 1e3 || cmd.Port >= 1e4 {
		// loggers.Error("--port must be between 1XXX and 9XXX.")
		// os.Exit(2)
	}
	return cmd
}

func parseExportArgs(args ...string) ExportCmd {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ExportCmd{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.Sourcemap, "sourcemap", true, "")
	if err := flagset.Parse(args); err != nil {
		// loggers.Error("Unrecognized flags and or arguments. " +
		// 	"Try retro help for help.")
		// os.Exit(2)
	}
	return cmd
}

func parseServeArgs(args ...string) ServeCmd {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ServeCmd{}
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	if err := flagset.Parse(args); err != nil {
		// loggers.Error("Unrecognized flags and or arguments. " +
		// 	"Try retro help for help.")
		// os.Exit(2)
	}
	if cmd.Port < 1e3 || cmd.Port >= 1e4 {
		// loggers.Error("--port must be between 1XXX and 9XXX.")
		// os.Exit(2)
	}
	return cmd
}

func ParseCLIArguments() (interface{}, error) {
	// Guard '% retro'
	if len(os.Args) == 1 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd interface{}
	if arg := os.Args[1]; arg == "version" || arg == "--version" || arg == "--v" {
		fmt.Println(os.Getenv("RETRO_VERSION"))
		os.Exit(0)
	} else if arg == "usage" || arg == "--usage" || arg == "help" || arg == "--help" {
		fmt.Println(usage)
		os.Exit(0)
	} else if arg == "dev" {
		os.Setenv("__DEV__", "true")
		os.Setenv("NODE_ENV", "development")
		cmd = parseDevArgs(os.Args[2:]...)
	} else if arg == "export" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseExportArgs(os.Args[2:]...)
	} else if arg == "serve" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseServeArgs(os.Args[2:]...)
	} else {
		// loggers.Error("Unrecognized command. " +
		// 	"Here are the available commands:\n\n" +
		// 	cmds)
		// os.Exit(2)
	}
	return cmd, nil
}
