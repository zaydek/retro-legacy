package main

import (
	"net/http"
	"os"
	"strconv"
)

func (r Retro) serve() {
	if _, err := os.Stat(r.Config.BuildDir); os.IsNotExist(err) {
		stderr.Fatalf("Failed to stat directory '%s'. "+
			"It looks like haven’t run 'retro build' yet. "+
			"Try 'retro build && retro serve'.\n", r.Config.BuildDir)
	}

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDir)))
	raw.Printf("✅ https://localhost:%d\n", r.Config.Port)

	must(http.ListenAndServe(":"+strconv.Itoa(r.Config.Port), nil))
}
