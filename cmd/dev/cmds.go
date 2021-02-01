package dev

import (
	"fmt"
	"net/http"
	"os"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func (r Runtime) Build() {
	must(copyAssetDirectoryToBuildDirectory(r.DirConfiguration))
	must(render.Props())
	must(render.App())
	must(render.Pages())
}

func (r Runtime) Serve() {
	if _, err := os.Stat(r.DirConfiguration.BuildDirectory); os.IsNotExist(err) {
		loggers.Stderr.Fatalln("Failed to stat directory " + term.Bold(r.DirConfiguration.BuildDirectory) + ". " +
			"It looks like haven’t run " + term.Bold("retro build") + " yet. " +
			"Try " + term.Bold("retro build && retro serve") + ".")
	}

	fmt.Printf("👾 http://localhost:%s\n", r.getPort())

	http.Handle("/", http.FileServer(http.Dir(r.DirConfiguration.BuildDirectory)))
	must(http.ListenAndServe(":"+r.getPort(), nil))
}
