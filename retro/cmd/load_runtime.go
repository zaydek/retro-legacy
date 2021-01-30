package cmd

import (
	"os"

	"github.com/google/uuid"
	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/retro/cli"
)

// loadRuntime parses CLI arguments and the page-based routes.
func loadRuntime() Runtime {
	var err error

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
		if runtime.Router, err = loadRouter(runtime.Config); err != nil {
			loggers.Stderr.Println(err)
			os.Exit(1)
		}
	}
	return runtime
}
