package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func parseStartArguments(arguments ...string) StartCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := StartCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.SourceMap, "source-map", false, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if (cmd.Port < 3e3 || cmd.Port >= 4e3) && (cmd.Port < 5e3 || cmd.Port >= 6e3) && (cmd.Port < 8e3 || cmd.Port >= 9e3) {
		loggers.Stderr.Println(term.Bold("--port") + " must be be " + term.Bold("3XXX") + " or " + term.Bold("5XXX") + " or " + term.Bold("8XXX") + ".")
		os.Exit(2)
	}
	return cmd
}

func parseBuildArguments(arguments ...string) BuildCommand {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := BuildCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.BoolVar(&cmd.SourceMap, "source-map", false, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
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
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if (cmd.Port < 3e3 || cmd.Port >= 4e3) && (cmd.Port < 5e3 || cmd.Port >= 6e3) && (cmd.Port < 8e3 || cmd.Port >= 9e3) {
		loggers.Stderr.Println(term.Bold("--port") + " must be be " + term.Bold("3XXX") + " or " + term.Bold("5XXX") + " or " + term.Bold("8XXX") + ".")
		os.Exit(2)
	}
	return cmd
}

func ParseCLIArguments() interface{} {
	// Cover []string{"retro"} case:
	if len(os.Args) == 1 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd interface{}
	switch os.Args[1] {
	// $ retro version
	case "version":
		fallthrough
	case "--version":
		fmt.Println("TODO")
		os.Exit(0)
	// $ retro usage
	case "usage":
		fallthrough
	case "--usage":
		fallthrough
	case "help":
		fallthrough
	case "--help":
		fmt.Println(usage)
		os.Exit(0)
	// $ retro start
	case "start":
		os.Setenv("NODE_ENV", "development")
		cmd = parseStartArguments(os.Args[2:]...)
	// $ retro build
	case "build":
		os.Setenv("NODE_ENV", "production")
		cmd = parseBuildArguments(os.Args[2:]...)
	// $ retro serve
	case "serve":
		os.Setenv("NODE_ENV", "production")
		cmd = parseServeArguments(os.Args[2:]...)
	default:
		loggers.Stderr.Println("Unrecognized command. " +
			"Try " + term.Bold("retro help") + " for help.\n\n" +
			usageOnly)
		os.Exit(2)
	}
	return cmd
}
