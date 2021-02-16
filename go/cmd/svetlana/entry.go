package svetlana

import (
	"fmt"
	"os"
	"time"

	"github.com/zaydek/svetlana/pkg/term"
)

func Run() {
	start := time.Now()
	defer term.Revert(os.Stdout)

	runtime, err := newRuntime()
	must(err)
	switch cmd := runtime.getCmd(); cmd {
	case CmdStart:
		runtime.Start()
	case CmdBuild:
		runtime.Build()
	case CmdServe:
		runtime.Serve()
	}
	fmt.Println(term.Boldf("⚡️ %0.3fs", time.Since(start).Seconds()))
}
