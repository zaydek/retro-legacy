package main

import (
	"flag"
	"fmt"
	"io/ioutil"
	"os"

	"github.com/zaydek/create-retro-app/loggers"
	"github.com/zaydek/create-retro-app/term"
)

// CreateRetroApp describes create-retro-app flags and arguments.
type CreateRetroApp struct {
	Template string

	// Arguments
	Directory string
}

func parseArgs(args ...string) CreateRetroApp {
	cmd := flag.NewFlagSet("create", flag.ContinueOnError)
	cmd.SetOutput(ioutil.Discard)

	parsed := CreateRetroApp{}
	cmd.StringVar(&parsed.Template, "template", "js", "")
	if err := cmd.Parse(args); err != nil {
		loggers.Stderr.Println("Unrecognized parsed and or arguments. " +
			"Try " + term.Bold("retro help") + " for help.")
		os.Exit(2)
	}
	if parsed.Template != "js" && parsed.Template != "ts" {
		loggers.Stderr.Println(term.Bold("--template") + " must be " + term.Bold("js") + " for JavaScript or " + term.Bold("ts") + " for TypeScript.\n\n" +
			"- " + term.Bold("create-retro-app --template=js [dir]") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("create-retro-app --template=ts [dir]") + "")
		os.Exit(2)
	}
	if len(cmd.Args()) == 0 {
		loggers.Stderr.Println("It looks like you’re trying to run " + term.Bold("create-retro-app") + " in the current directory. " +
			"In that case, use " + term.Bold(".") + " explicitly.\n\n" +
			"- " + term.Bold("create-retro-app .") + "\n\n" +
			"Or\n\n" +
			"- " + term.Bold("create-retro-app [dir]"))
		os.Exit(2)
	}
	parsed.Directory = cmd.Args()[0]
	return parsed
}

// ` + term.BoldGreen("$") + ` ` + term.Bold("create-retro-app") + ` [` + term.Underline("name") + `] --template=[` + term.Underline("javascript") + `|` + term.Underline("typescript") + `]
func main() {
	if len(os.Args) < 2 {
		fmt.Println(`
  ` + term.BoldGreen("👾") + ` ` + term.Bold("create-retro-app") + ` ` + term.Underline("name") + ` --template=[javascript|typescript]

  Creates a new Retro app at directory ` + term.Underline("name") + `.

  Then run:

    ` + term.Bold("npm") + `

      1. cd ` + term.Underline("name") + `
      2. npm
      3. npm run watch

    ` + term.Bold("yarn") + `

      1. cd ` + term.Underline("name") + `
      2. yarn
      3. yarn watch

  Happy hacking!
`)
		os.Exit(0)
	}
	parseArgs(os.Args[1:]...)
}
