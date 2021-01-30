package cmd

import "fmt"

type Command struct{}

func (cmd Command) Thing() {}

func Thing() {
	var cmd Command
	fmt.Println(cmd)
}
