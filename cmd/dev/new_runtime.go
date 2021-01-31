package dev

import (
	"os"

	"github.com/google/uuid"
	"github.com/zaydek/retro/cmd/dev/cli"
	"github.com/zaydek/retro/pkg/errs"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/perm"
)

// statOrCreateDir stats for the presence of a directory or creates one.
func statOrCreateDir(dir string) error {
	if _, err := os.Stat(dir); os.IsNotExist(err) {
		if err := os.MkdirAll(dir, perm.Directory); err != nil {
			return errs.MkdirAll(dir, err)
		}
	}
	return nil
}

// runServerGuards runs server guards on the configuration.
func runServerGuards(config DirConfiguration) error {
	dirs := []string{config.AssetDirectory, config.PagesDirectory, config.BuildDirectory}
	for _, each := range dirs {
		if err := statOrCreateDir(each); err != nil {
			return err
		}
	}
	return nil
}

func newRuntime() Runtime {
	runtime := Runtime{
		epochUUID: uuid.NewString(),
		Config: DirConfiguration{
			AssetDirectory: "public",
			PagesDirectory: "pages",
			CacheDirectory: "__cache__",
			BuildDirectory: "build",
		},
	}

	runtime.Command = cli.ParseCLIArguments()
	if cmd := runtime.getCmd(); cmd == "watch" || cmd == "build" {
		var err error
		if runtime.Router, err = readRouter(runtime.Config); err != nil {
			loggers.Stderr.Fatalln(err)
		}
	}

	if cmd := runtime.getCmd(); cmd == "watch" || cmd == "build" {
		if err := runServerGuards(runtime.Config); err != nil {
			loggers.Stderr.Fatalln(err)
		}
	}
	return runtime
}
