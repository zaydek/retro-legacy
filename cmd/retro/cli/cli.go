package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
)

func parseDevArguments(arguments ...string) DevCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := DevCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.FastRefresh, "fast_refresh", true, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.Sourcemap, "sourcemap", true, "")
	if err := flagset.Parse(arguments); err != nil {
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

func parseExportArguments(arguments ...string) ExportCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ExportCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.SourceMap, "sourcemap", true, "")
	if err := flagset.Parse(arguments); err != nil {
		// loggers.Error("Unrecognized flags and or arguments. " +
		// 	"Try retro help for help.")
		// os.Exit(2)
	}
	return cmd
}

func parseServeArguments(arguments ...string) ServeCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := ServeCommand{}
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	if err := flagset.Parse(arguments); err != nil {
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

func ParseCLIArguments() interface{} {
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
		cmd = parseDevArguments(os.Args[2:]...)
	} else if arg == "export" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseExportArguments(os.Args[2:]...)
	} else if arg == "serve" {
		os.Setenv("__DEV__", "false")
		os.Setenv("NODE_ENV", "production")
		cmd = parseServeArguments(os.Args[2:]...)
	} else {
		// loggers.Error("Unrecognized command. " +
		// 	"Here are the available commands:\n\n" +
		// 	cmds)
		// os.Exit(2)
	}
	return cmd
}
