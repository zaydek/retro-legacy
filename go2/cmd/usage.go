package main

import (
	_ "embed"

	"fmt"
)

//go:embed usage.txt
var usageMessage string

func (r Retro) help() {
	fmt.Fprintln(r.stdout, usageMessage)
}

func (r Retro) unknown(cmd string) {
	fmt.Fprintln(r.stderr, fmt.Sprintf("🤔 unknown command %s; try retro help", cmd))
}
