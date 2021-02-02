package dev

import (
	_ "embed"
	"fmt"
	"os"
	"time"

	"github.com/zaydek/retro/pkg/term"
)

// func init() {
// 	rand.Seed(time.Now().UTC().UnixNano())
// }

func Run() {
	start := time.Now()
	defer term.Revert(os.Stdout)

	runtime := newRuntime()
	switch cmd := runtime.getCmd(); cmd {
	case CmdStart:
		runtime.Start()
	case CmdBuild:
		runtime.Build()
	case CmdServe:
		runtime.Serve()
	}
	fmt.Printf("⚡️ %0.3fs\n", time.Since(start).Seconds())
}
