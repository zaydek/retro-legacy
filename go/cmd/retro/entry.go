package retro

import (
	"os"
	"time"

	"github.com/zaydek/retro/pkg/term"
)

var start = time.Now()

func Run() {
	defer term.Revert(os.Stdout)

	runtime, err := newRuntime()
	must(err)
	switch typ := runtime.getCmdType(); typ {
	case CmdDev:
		runtime.Dev()
	case CmdExport:
		runtime.Export()
	case CmdServe:
		runtime.Serve()
	}
}
