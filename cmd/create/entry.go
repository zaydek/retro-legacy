package create

import (
	_ "embed"
	"fmt"
	"os"
)

func Run() {
	// Cover []string{"create-retro-app"} case:
	if len(os.Args) == 1 {
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
