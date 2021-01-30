package create

import (
	_ "embed"
	"fmt"
	"os"

	"github.com/zaydek/retro/pkg/env"
)

func Run() {
	//go:embed version.txt
	var text string
	env.SetEnvVars(text)

	if len(os.Args) < 2 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd Command
	switch os.Args[1] {
	case "version":
		fallthrough
	case "--version":
		fmt.Println("TODO")
		os.Exit(0)
	case "help":
		fallthrough
	case "--help":
		fallthrough
	case "usage":
		fallthrough
	case "--usage":
		fmt.Println(usage)
		os.Exit(0)
	default:
		cmd = parseArguments(os.Args[1:]...)
	}

	cmd.CreateRetroApp()
}
