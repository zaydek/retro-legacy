package main

import (
	"net/http"
	"os"
	"strconv"
)

// TODO: port := resolvePort()
func (r Retro) serve() {
	port := 8080

	if _, err := os.Stat(r.Config.BuildDir); os.IsNotExist(err) {
		stderr.Fatalf("Failed to stat directory '%s'. "+
			"It looks like haven’t run 'retro build' yet. "+
			"Try 'retro build && retro serve'.\n", r.Config.BuildDir)
	}

	http.Handle("/", http.FileServer(http.Dir(r.Config.BuildDir)))
	raw.Printf("✅ https://localhost:%d\n", port)
	if err := http.ListenAndServe(":"+strconv.Itoa(port), nil); err != nil {
		stderr.Fatalln(err)
	}
}
