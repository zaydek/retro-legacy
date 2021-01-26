package main

import (
	"fmt"

	"github.com/zaydek/retro/cli"
)

type App struct {
	cli.Commands
}

func main() {
	cmds := cli.ParseCLIArguments()
	fmt.Printf("%+v\n", cmds)
}
