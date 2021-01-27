package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"

	"github.com/zaydek/retro/color"
	"github.com/zaydek/retro/loggers"
)

func (r Runtime) Serve() {
	if _, err := os.Stat(r.Config.BuildDirectory); os.IsNotExist(err) {
		loggers.Stderr.Println("Failed to stat directory " + color.Bold(r.Config.BuildDirectory) + ". " +
			"It looks like haven’t run " + color.Bold("retro build") + " yet. " +
			"Try " + color.Bold("retro build && retro serve") + ".")
		os.Exit(1)
	}

	fmt.Printf("👾 http://localhost:%d\n", r.getPort())

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDirectory)))
	must(http.ListenAndServe(":"+strconv.Itoa(int(r.getPort())), nil))
}
