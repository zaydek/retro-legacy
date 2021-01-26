package cli

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"
	"strings"
	"time"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/loggers"
)

func parseCreateCommandFlags(args []string) *CreateCommandFlags {
	cmd := flag.NewFlagSet("create", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := &CreateCommandFlags{}
	cmd.StringVar(&flags.Language, "language", "js", "")
	if err := cmd.Parse(args); err != nil || len(cmd.Args()) > 0 {
		loggers.Stderr.Println(color.Boldf("'retro %s'", strings.Join(os.Args[1:], " ")) + " uses unknown flags and or arguments. " +
			"Try " + color.Bold("'retro help'") + " for help.")
		os.Exit(2)
	}
	if flags.Language != "js" && flags.Language != "ts" {
		loggers.Stderr.Println(color.Bold("'--language'") + " must be " + color.Bold("'js'") + " for JavaScript or " + color.Bold("'ts'") + " for TypeScript.\n\n" +
			"- Try " + color.Bold("'retro create --language=js ...'") + " for JavaScript\n" +
			"- Try " + color.Bold("'retro create --language=ts ...'") + " for TypeScript")
		os.Exit(2)
	}
	return flags
}

func parseWatchCommandFlags(args []string) *WatchCommandFlags {
	cmd := flag.NewFlagSet("watch", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := &WatchCommandFlags{}
	cmd.DurationVar(&flags.Poll, "poll", 250*time.Millisecond, "")
	cmd.IntVar(&flags.Port, "port", 8000, "")
	if err := cmd.Parse(args); err != nil || len(cmd.Args()) > 0 {
		loggers.Stderr.Println(color.Boldf("'retro %s'", strings.Join(os.Args[1:], " ")) + " uses unknown flags and or arguments. " +
			"Try " + color.Bold("'retro help'") + " for help.")
		os.Exit(2)
	}
	if flags.Poll < (100*time.Millisecond) && flags.Poll >= (10*time.Second) {
		loggers.Stderr.Println(color.Bold("'--poll'") + " must be between " + color.Bold("'100ms'") + " and " + color.Bold("'10s'") + ".")
		os.Exit(2)
	} else if (flags.Port < 3e3 || flags.Port >= 4e3) && (flags.Port < 5e3 || flags.Port >= 6e3) && (flags.Port < 8e3 || flags.Port >= 9e3) {
		loggers.Stderr.Println(color.Bold("'--port'") + " must be be " + color.Bold("'3XXX'") + " or " + color.Bold("'5XXX'") + " or " + color.Bold("'8XXX'") + ".")
		os.Exit(2)
	}
	for _, each := range cmd.Args() {
		if _, err := os.Stat(each); os.IsNotExist(err) {
			loggers.Stderr.Println("Failed to stat file or directory " + color.Boldf("'%s'", each) + ".")
			os.Exit(2)
		}
	}
	flags.Directories = cmd.Args()
	return flags
}

func parseBuildCommandFlags(args []string) *BuildCommandFlags {
	cmd := flag.NewFlagSet("build", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := &BuildCommandFlags{}
	cmd.BoolVar(&flags.Cached, "cached", false, "")
	if err := cmd.Parse(args); err != nil || len(cmd.Args()) > 0 {
		loggers.Stderr.Println(color.Boldf("'retro %s'", strings.Join(os.Args[1:], " ")) + " uses unknown flags and or arguments. " +
			"Try " + color.Bold("'retro help'") + " for help.")
		os.Exit(2)
	}
	return flags
}

func parseServeCommandFlags(args []string) *ServeCommandFlags {
	cmd := flag.NewFlagSet("serve", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	flags := &ServeCommandFlags{}
	cmd.IntVar(&flags.Port, "port", 8000, "")
	if err := cmd.Parse(args); err != nil || len(cmd.Args()) > 0 {
		loggers.Stderr.Println(color.Boldf("'retro %s'", strings.Join(os.Args[1:], " ")) + " uses unknown flags and or arguments. " +
			"Try " + color.Bold("'retro help'") + " for help.")
		os.Exit(2)
	}
	if (flags.Port < 3e3 || flags.Port >= 4e3) && (flags.Port < 5e3 || flags.Port >= 6e3) && (flags.Port < 8e3 || flags.Port >= 9e3) {
		loggers.Stderr.Println(color.Bold("'--port'") + " must be be " + color.Bold("'3XXX'") + " or " + color.Bold("'5XXX'") + " or " + color.Bold("'8XXX'") + ".")
		os.Exit(2)
	}
	return flags
}

var usageStr = `
	` + color.BoldWhite("Usage:") + `

		retro create [dir]      ` + color.Underline("Creates") + ` a new Retro app at directory 'dir'
		retro watch [...dirs]   Starts the development server and ` + color.Underline("watches") + ` 'dirs' for changes
		retro build             ` + color.Underline("Builds") + ` the production-ready build
		retro serve             ` + color.Underline("Serves") + ` the production-ready build

	` + color.BoldWhite("retro create [dir]") + `

		'retro create' creates a new Retro app at directory 'dir'

			--language=[js | ts]  Programming language (default 'js')

	` + color.BoldWhite("retro watch [...dirs]") + `

		'retro watch' starts a development server and watches directories 'dirs' for
		changes (default 'components pages')

			--poll=<duration>     Poll duration (default '250ms')
			--port=<number>       Port number (default '8000')

	` + color.BoldWhite("retro build") + `

		'retro build' builds the production-ready build

			--cached              Use cached props for faster builds (disabled by default)

	` + color.BoldWhite("retro serve") + `

		'retro serve' serves the production-ready build

			--port=<number>       Port number (default '8000')

	` + color.BoldWhite("Repository:") + `

		` + color.Underline("https://github.com/zaydek/retro") + `
`

func version() {
	fmt.Println("TODO")
}

func usage() {
	fmt.Println(usageStr)
}

func ParseCLIArguments() Commands {
	if len(os.Args) < 2 {
		usage()
		os.Exit(0)
	}
	// Guard extraneous commands:
	cmd := os.Args[1]
	if cmd == "version" || cmd == "--version" {
		version()
		os.Exit(0)
	} else if cmd == "usage" || cmd == "--usage" || cmd == "help" || cmd == "--help" {
		usage()
		os.Exit(0)
	}
	// Guard commands:
	if cmd != "create" && cmd != "watch" && cmd != "build" && cmd != "serve" {
		usage()
		os.Exit(0)
	}
	var cmds Commands
	if cmd == "create" {
		cmds.CreateCommand = parseCreateCommandFlags(os.Args[2:])
	} else if cmd == "watch" {
		cmds.WatchCommand = parseWatchCommandFlags(os.Args[2:])
	} else if cmd == "build" {
		cmds.BuildCommand = parseBuildCommandFlags(os.Args[2:])
	} else if cmd == "serve" {
		cmds.ServeCommand = parseServeCommandFlags(os.Args[2:])
	}
	return cmds
}
