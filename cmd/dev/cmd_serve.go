package dev

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/zaydek/retro/pkg/loggers"
	"github.com/zaydek/retro/pkg/term"
)

func (r Runtime) Serve() {
	if _, err := os.Stat(r.Config.BuildDirectory); os.IsNotExist(err) {
		loggers.Stderr.Println("Failed to stat directory " + term.Bold(r.Config.BuildDirectory) + ". " +
			"It looks like haven’t run " + term.Bold("retro build") + " yet. " +
			"Try " + term.Bold("retro build && retro serve") + ".")
		os.Exit(1)
	}

	fmt.Printf("👾 http://localhost:%d\n", r.getPort())

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDirectory)))
	check(http.ListenAndServe(":"+strconv.Itoa(int(r.getPort())), nil))
}
