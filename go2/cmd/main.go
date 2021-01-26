package main

import (
	"os"

	"github.com/zaydek/retro/cli"
	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/loggers"
)

func startRuntime() Runtime {
	var err error

	var runtime Runtime
	runtime.Commands = cli.ParseCLIArguments()
	if runtime.Config, err = loadConfig(); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	if runtime.Router, err = loadRouter(runtime.Config); err != nil {
		loggers.Stderr.Println(err)
		os.Exit(1)
	}
	return runtime
}

func main() {
	// start := time.Now()
	// defer func() { fmt.Println("⚡️ %0.3fs\n", time.Since(now).Seconds()) }()

	defer color.TerminateFormatting(os.Stdout)

	// runtime := loadRuntime()
	startRuntime()
}
