package main

import (
	"fmt"
	"os"

	"github.com/zaydek/retro/pkg/ipc"
	"github.com/zaydek/retro/pkg/stdio_logger"
)

func main() {
	send, err := ipc.NewCommand("node functions-node.esbuild.js")
	if err != nil {
		panic(err)
	}

	run := func() (string, error) { return send(ipc.Message{Kind: "run"}) }
	rerun := func() (string, error) { return send(ipc.Message{Kind: "rerun"}) }

	out1, err := run()
	if err != nil {
		stdio_logger.Stderr(fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	stdio_logger.Stdout(out1)

	out2, err := rerun()
	if err != nil {
		stdio_logger.Stderr(fmt.Errorf("stderr: %w", err))
		os.Exit(1)
	}
	stdio_logger.Stdout(out2)
}
