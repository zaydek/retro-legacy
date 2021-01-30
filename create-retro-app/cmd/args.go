package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/create-retro-app/loggers"
	"github.com/zaydek/create-retro-app/term"
)

func parseArgs(args ...string) Command {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := Command{}
	flagset.StringVar(&cmd.Template, "template", "js", "")
	if err := flagset.Parse(args); err != nil {
		fmt.Println(usage)
		os.Exit(2)
	}
	if cmd.Template != "js" && cmd.Template != "ts" {
		loggers.Stderr.Println(term.Bold("--template") + " must be " + term.Bold("js") + " for JavaScript or " + term.Bold("ts") + " for TypeScript.\n\n" +
			"- " + term.Bold("create-retro-app --template=js "+term.Underline("app-name")) + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("create-retro-app --template=ts "+term.Underline("app-name")) + "")
		os.Exit(2)
	}
	cmd.Directory = flagset.Args()[0]
	return cmd
}
