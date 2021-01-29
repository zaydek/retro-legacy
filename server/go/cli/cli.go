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

func parseCreateCommandArgs(args ...string) CreateCommand {
	cmd := flag.NewFlagSet("create", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := CreateCommand{}
	cmd.StringVar(&flags.Template, "template", "js", "")
	if err := cmd.Parse(args); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if flags.Template != "js" && flags.Template != "ts" {
		loggers.Stderr.Println(term.Bold("--template") + " must be " + term.Bold("js") + " for JavaScript or " + term.Bold("ts") + " for TypeScript.\n\n" +
			"- " + term.Bold("retro create --template=js [dir]") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("retro create --template=ts [dir]") + "")
		os.Exit(2)
	}
	if len(cmd.Args()) == 0 {
		loggers.Stderr.Println("It looks like you’re trying to run " + term.Bold("retro create") + " in the current directory. " +
			"In that case, use " + term.Bold(".") + " explicitly.\n\n" +
			"- " + term.Bold("retro create .") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("retro create [dir]"))
		os.Exit(2)
	}
	flags.Directory = cmd.Args()[0]
	return flags
}

func parseWatchCommandArgs(args ...string) WatchCommand {
	cmd := flag.NewFlagSet("watch", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := WatchCommand{}
	cmd.BoolVar(&flags.Cached, "cached", false, "")
	cmd.DurationVar(&flags.Poll, "poll", 250*time.Millisecond, "")
	cmd.IntVar(&flags.Port, "port", 8000, "")
	cmd.BoolVar(&flags.SourceMap, "source-map", false, "")
	if err := cmd.Parse(args); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if flags.Poll < (100*time.Millisecond) || flags.Poll >= (10*time.Second) {
		loggers.Stderr.Println(term.Bold("--poll") + " must be between " + term.Bold("100ms") + " and " + term.Bold("10s") + ".")
		os.Exit(2)
	} else if (flags.Port < 3e3 || flags.Port >= 4e3) && (flags.Port < 5e3 || flags.Port >= 6e3) && (flags.Port < 8e3 || flags.Port >= 9e3) {
		loggers.Stderr.Println(term.Bold("--port") + " must be be " + term.Bold("3XXX") + " or " + term.Bold("5XXX") + " or " + term.Bold("8XXX") + ".")
		os.Exit(2)
	}
	// TODO: If we want to stat for the presence of paths, uncomment the following
	// code. This assets the presence of a file or directory.
	// for _, each := range cmd.Args() {
	// 	if _, err := os.Stat(each); os.IsNotExist(err) {
	// 		loggers.Stderr.Println("Failed to stat file or directory " + term.Bold(each) + ".")
	// 		os.Exit(2)
	// 	}
	// }
	flags.Paths = []string{"pages"}
	if len(cmd.Args()) > 0 {
		flags.Paths = cmd.Args()
	}
	return flags
}

func parseBuildCommandArgs(args ...string) BuildCommand {
	cmd := flag.NewFlagSet("build", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := BuildCommand{}
	cmd.BoolVar(&flags.Cached, "cached", false, "")
	cmd.BoolVar(&flags.SourceMap, "source-map", false, "")
	if err := cmd.Parse(args); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	return flags
}

func parseServeCommandArgs(args ...string) ServeCommand {
	cmd := flag.NewFlagSet("serve", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := ServeCommand{}
	cmd.IntVar(&flags.Port, "port", 8000, "")
	if err := cmd.Parse(args); err != nil {
		loggers.Stderr.Println("Unrecognized flags and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if (flags.Port < 3e3 || flags.Port >= 4e3) && (flags.Port < 5e3 || flags.Port >= 6e3) && (flags.Port < 8e3 || flags.Port >= 9e3) {
		loggers.Stderr.Println(term.Bold("--port") + " must be be " + term.Bold("3XXX") + " or " + term.Bold("5XXX") + " or " + term.Bold("8XXX") + ".")
		os.Exit(2)
	}
	return flags
}

func ParseCLIArguments() interface{} {
	var cmd interface{}

	// $ retro
	if len(os.Args) < 2 {
		usage()
		os.Exit(0)
	}

	switch os.Args[1] {

	// $ retro usage
	case "usage":
		fallthrough
	case "--usage":
		usage()
		os.Exit(0)

	// $ retro help
	case "help":
		fallthrough
	case "--help":
		usage()
		os.Exit(0)

	// $ retro version
	case "version":
		fallthrough
	case "--version":
		fallthrough
	case "-v":
		version()
		os.Exit(0)

	// $ retro create
	case "create":
		os.Setenv("NODE_ENV", "development")
		cmd = parseCreateCommandArgs(os.Args[2:]...)

	// $ retro watch
	case "watch":
		os.Setenv("NODE_ENV", "development")
		cmd = parseWatchCommandArgs(os.Args[2:]...)

	// $ retro build
	case "build":
		os.Setenv("NODE_ENV", "production")
		cmd = parseBuildCommandArgs(os.Args[2:]...)

	// $ retro serve
	case "serve":
		os.Setenv("NODE_ENV", "production")
		cmd = parseServeCommandArgs(os.Args[2:]...)

	default:
		loggers.Stderr.Println("Unrecognized command. " +
			"Try " + term.Bold("retro help") + " for help.\n\n" +
			usageOnly)
		os.Exit(2)
	}
	return cmd
}
