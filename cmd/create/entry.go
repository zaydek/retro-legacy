package create

import (
	_ "embed"
	"fmt"
	"os"
)

func Run() {
	var cmd Command

	var arg string
	if len(os.Args) > 1 {
		arg = os.Args[1]
	}

	switch arg {
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
