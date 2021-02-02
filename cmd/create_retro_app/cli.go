package create_retro_app

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func parseArguments(arguments ...string) Command {
	flagset := flag.NewFlagSet("", flag.ContinueOnError)
	flagset.SetOutput(ioutil.Discard)

	cmd := Command{}
	flagset.StringVar(&cmd.Template, "template", "javascript", "")
	if err := flagset.Parse(arguments); err != nil {
		fmt.Println(usage)
		os.Exit(2)
	}
	if cmd.Template != "javascript" && cmd.Template != "typescript" {
		loggers.Stderr.Println(term.Bold("--template") + " must be " + term.Bold("javascript") + " or " + term.Bold("typescript") + ".\n\n" +
			"- " + term.Bold("create-retro-app --template=javascript app-name") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("create-retro-app --template=javascript app-name") + "")
		os.Exit(2)
	}
	if len(flagset.Args()) == 0 {
		loggers.Stderr.Println("It looks like you’re trying to run " + term.Bold("create-retro-app") + " in the current directory. " +
			"In that case, use " + term.Boldf("%q", ".") + " explicitly.\n\n" +
			"- " + term.Bold("create-retro-app .") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("create-retro-app app-name"))
		os.Exit(2)
	}
	cmd.Directory = "."
	if len(flagset.Args()) > 0 {
		cmd.Directory = flagset.Args()[0]
	}
	return cmd
}
