package dev

import (
	"github.com/google/uuid"
	"github.com/zaydek/retro/cmd/dev/cli"
	"github.com/zaydek/retro/pkg/loggers"
)

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
