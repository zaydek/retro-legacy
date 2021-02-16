package create_svetlana_app

import (
	"fmt"
	"os"
)

func Run() {
	// Cover []string{"create-svetlana-app"} case:
	if len(os.Args) == 1 {
		fmt.Println(usage)
		os.Exit(0)
	}

	var cmd Command
	if arg := os.Args[1]; arg == "version" || arg == "--version" || arg == "-v" {
		fmt.Println(os.Getenv("SVETLANA_VERSION"))
		os.Exit(0)
	} else if arg == "help" || arg == "--help" || arg == "usage" || arg == "--usage" {
		fmt.Println(usage)
		os.Exit(0)
	} else {
		cmd = parseArguments(os.Args[1:]...)
	}
	cmd.CreateApp()
}
