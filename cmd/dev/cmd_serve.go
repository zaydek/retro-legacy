package dev

import (
	"fmt"
	"net/http"
	"os"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func (r Runtime) Serve() {
	if _, err := os.Stat(r.Config.BuildDirectory); os.IsNotExist(err) {
		loggers.Stderr.Fatalln("Failed to stat directory " + term.Bold(r.Config.BuildDirectory) + ". " +
			"It looks like haven’t run " + term.Bold("retro build") + " yet. " +
			"Try " + term.Bold("retro build && retro serve") + ".")
	}

	fmt.Printf("👾 http://localhost:%s\n", r.getPortString())

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDirectory)))
	check(http.ListenAndServe(":"+r.getPortString(), nil))
}
