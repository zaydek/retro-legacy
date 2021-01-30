package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"time"

	"github.com/zaydek/retro/loggers"
	"github.com/zaydek/retro/term"
)

func version() {
	fmt.Println("TODO")
}

func usage() {
	fmt.Println(manpages)
}

func parseWatchArguments(arguments ...string) WatchCommand {
	flagset := flag.NewFlagSet("watch", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := WatchCommand{}
	flagset.BoolVar(&cmd.Cached, "cached", false, "")
	flagset.DurationVar(&cmd.Poll, "poll", 250*time.Millisecond, "")
	flagset.IntVar(&cmd.Port, "port", 8000, "")
	flagset.BoolVar(&cmd.SourceMap, "source-map", false, "")
	if err := flagset.Parse(arguments); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if cmd.Poll < (100*time.Millisecond) || cmd.Poll >= (10*time.Second) {
		loggers.Stderr.Println(term.Bold("--poll") + " must be between " + term.Bold("100ms") + " and " + term.Bold("10s") + ".")
		os.Exit(2)
	} else if (cmd.Port < 3e3 || cmd.Port >= 4e3) && (cmd.Port < 5e3 || cmd.Port >= 6e3) && (cmd.Port < 8e3 || cmd.Port >= 9e3) {
		loggers.Stderr.Println(term.Bold("--port") + " must be be " + term.Bold("3XXX") + " or " + term.Bold("5XXX") + " or " + term.Bold("8XXX") + ".")
		os.Exit(2)
	}
	cmd.Paths = []string{"pages"}
	if len(flagset.Args()) > 0 {
		cmd.Paths = flagset.Args()
	}
	return cmd
}

func parseBuildArguments(arguments ...string) BuildCommand {
	flagset := flag.NewFlagSet("build", flag.ContinueOnError)
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
	flagset := flag.NewFlagSet("serve", flag.ContinueOnError)
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
	if len(os.Args) < 2 {
		usage()
		os.Exit(0)
	}

	var cmd interface{}
	switch os.Args[1] {

	// $ retro version
	case "version":
		fallthrough
	case "--version":
		version()
		os.Exit(0)

	// $ retro usage
	case "usage":
		fallthrough
	case "--usage":
		fallthrough
	case "help":
		fallthrough
	case "--help":
		usage()
		os.Exit(0)

	// $ retro watch
	case "watch":
		os.Setenv("NODE_ENV", "development")
		cmd = parseWatchArguments(os.Args[2:]...)

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
