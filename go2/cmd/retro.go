package main

import (
	"fmt"
	"io"
)

// Retro is a namespace for commands.
type Retro struct {
	stdout io.Writer // In writer
	stderr io.Writer // Out writer
}

func newRetro(stdout, stderr io.Writer) Retro {
	return Retro{stdout: stdout, stderr: stderr}
}

func (r Retro) version() {
	fmt.Fprintln(r.stdout, "😡 TODO")
}

func (r Retro) watch() {
	fmt.Fprintln(r.stdout, "😡 TODO")
}

func (r Retro) build() {
	fmt.Fprintln(r.stdout, "😡 TODO")
}

func (r Retro) serve() {
	fmt.Fprintln(r.stdout, "😡 TODO")
}
