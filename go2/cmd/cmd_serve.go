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
		// loggers.Stderr.Printf("Failed to stat directory '%s'. "+
		// 	"It looks like haven’t run 'retro build' yet. "+
		// 	"Try 'retro build && retro serve'.\n", r.Config.BuildDirectory)
		loggers.Stderr.Println("Failed to stat directory " + color.Boldf("'%s'", r.Config.BuildDirectory) + ". " +
			"It looks like haven’t run " + color.Boldf("'retro build'") + " yet. " +
			"Try " + color.Bold("'retro build && retro serve'") + ".")
		os.Exit(1)
	}

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDirectory)))
	fmt.Println("👾 https://localhost:%d\n", r.getPort())

	must(http.ListenAndServe(":"+strconv.Itoa(int(r.getPort())), nil))
}
