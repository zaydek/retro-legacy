package main

import (
	"net/http"
	"os"
	"strconv"
)

func (app *RetroApp) serve() {
	if _, err := os.Stat(app.Configuration.BuildDirectory); os.IsNotExist(err) {
		stderr.Printf("Failed to stat directory '%s'. "+
			"It looks like haven’t run 'retro build' yet. "+
			"Try 'retro build && retro serve'.\n", app.Configuration.BuildDirectory)
		os.Exit(1)
	}

	http.Handle("/", http.FileServer(http.Dir(app.Configuration.BuildDirectory)))
	raw.Printf("✅ https://localhost:%d\n", app.Configuration.Port)

	must(http.ListenAndServe(":"+strconv.Itoa(int(app.Configuration.Port)), nil))
}
