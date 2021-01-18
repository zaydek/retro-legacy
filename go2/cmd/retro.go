package main

import (
	"fmt"
	"os"
)

// Retro is a namespace for commands.
type Retro struct{}

func (r Retro) version() {
	fmt.Fprintln(os.Stdout, "0.0.x")
}

func (r Retro) watch() {
	fmt.Fprintln(os.Stdout, "😡 TODO")
}

func (r Retro) build() {
	fmt.Fprintln(os.Stdout, "😡 TODO")
}

func (r Retro) serve() {
	fmt.Fprintln(os.Stdout, "😡 TODO")
}
