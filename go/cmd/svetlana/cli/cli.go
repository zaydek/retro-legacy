package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/svetlana/pkg/loggers"
)

func parseStartArguments(arguments ...string) StartCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := StartCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.Prettier, "prettier", true, "")
	flagset.BoolVar(&cmd.SourceMap, "source-map", true, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Error("Unrecognized flags and or arguments. " +
			"Try `svetlana help` for help.")
		os.Exit(2)
	}
	if (cmd.Port < 3e3 || cmd.Port >= 4e3) && (cmd.Port < 5e3 || cmd.Port >= 6e3) && (cmd.Port < 8e3 || cmd.Port >= 9e3) {
		loggers.Error("`--port` must be 3XXX or 5XXX or 8XXX.")
		os.Exit(2)
	}
	return cmd
}

func parseBuildArguments(arguments ...string) BuildCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := BuildCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.Prettier, "prettier", true, "")
	flagset.BoolVar(&cmd.SourceMap, "source-map", true, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Error("Unrecognized flags and or arguments. " +
			"Try `svetlana help` for help.")
		os.Exit(2)
	}
	return cmd
}

func parseServeArguments(arguments ...string) ServeCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ServeCommand{}
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Error("Unrecognized flags and or arguments. " +
			"Try `svetlana help` for help.")
		os.Exit(2)
	}
	if (cmd.Port < 3e3 || cmd.Port >= 4e3) && (cmd.Port < 5e3 || cmd.Port >= 6e3) && (cmd.Port < 8e3 || cmd.Port >= 9e3) {
		loggers.Error("`--port` must be 3XXX or 5XXX or 8XXX.")
		os.Exit(2)
	}
	return cmd
}

func ParseCLIArguments() interface{} {
	// Cover []string{"svetlana"} case:
	if len(os.Args) == 1 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd interface{}
	if arg := os.Args[1]; arg == "version" || arg == "--version" || arg == "--v" {
		fmt.Println(os.Getenv("SVETLANA_VERSION"))
		os.Exit(0)
	} else if arg == "usage" || arg == "--usage" || arg == "help" || arg == "--help" {
		fmt.Println(usage)
		os.Exit(0)
	} else if arg == "start" {
		os.Setenv("__DEV__", "true")
		os.Setenv("NODE_ENV", "development")
		cmd = parseStartArguments(os.Args[2:]...)
	} else if arg == "build" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseBuildArguments(os.Args[2:]...)
	} else if arg == "serve" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseServeArguments(os.Args[2:]...)
	} else {
		loggers.Error("Unrecognized command. " +
			"Here are the available commands:\n\n" +
			usageOnly)
		os.Exit(2)
	}
	return cmd
}
