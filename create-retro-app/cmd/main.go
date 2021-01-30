package main

import (
	_ "embed"

	"fmt"
	"os"

	"github.com/zaydek/create-retro-app/env"
)

func main() {
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
		//go:embed env.txt
		var text string
		env.SetEnvVars(text)
		cmd = parseArgs(os.Args[1:]...)
	}

	cmd.CreateRetroApp()
}
